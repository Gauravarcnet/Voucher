const Voucher = require("./voucher.model")
const bcrypt = require('bcrypt')
var appLogger = require('./../../utils/appLogger')
var sendMail = require('./../../utils/sendMail')
const mongoose = require('mongoose')

/* 
    Success and errors are the response method that we have defined 
    already in response So we can follow standward way and error handling
*/

const {
  success,
  errors
} = require('../../utils').response


function VoucherCtrl() {
  const methods = {

    //Generating coupon code with Prefix - “VCD”, Suffix- 10 Random strings and numbers.
    voucherCode: async () => {
      try {
        let coupon = "VCD",
          length = 10,
          possible = "abcdefghijklmnopqrstuvwxyz0123456789"

        for (let i = 0; i < length; i++) {
          coupon += possible.charAt(Math.floor(Math.random() * possible.length))
        }

        return coupon

      } catch (e) {
        console.log(e)
        return errors(e)
      }
    },

    //Generating pin code with Prefix - “VCD”, Suffix- 5 Random strings.

    voucherPin: async () => {
      try {
        let pin = ""
        const length = 5
        let possible = "abcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < length; i++) {
          pin += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return pin

      } catch (e) {
        console.log(e)
        return errors(e)
      }
    },

    //Voucher Generate Api

    voucherCreate: async (req, res) => {
      try {

        /*  I have not used joi validation otherwise we can 
                  allow only valid keys.
                  Validation On keys like key will not be empty or follow particular pattern 
                  example on email and amount 
        */
        const value = req.body

        if (!value.email || value.email === '' || !value.amount || value.amount < 0) {
          return errors(res, 400, "Email/Amount is required")
        }
        const email = value.email,

          code = await methods.voucherCode(),
          amount = value.amount
        let pin = await methods.voucherPin()
        pin = bcrypt.hashSync(pin, bcrypt.genSaltSync(8), null)
        console.log("pin", pin);


        let newVoucher = new Voucher({
          email: email || '',
          code: code || '',
          pin: pin || '',
          amount: amount || 1000,
          generationTime: new Date().valueOf()
        })
        let newVoucherData = await newVoucher.save()

        //Generating email template
        let html = `</br><br>
                  <b style="font-weight: bolder;">
                  Coupon Code : ${code}</br><br>
                  Pin : ${pin}
                  </b>`
        let emailTemplate = await methods.emailTemplate(html)
        if (newVoucherData._id) {
          appLogger.info(newVoucherData)
          sendMail.sendMail(newVoucherData.email, emailTemplate, 'Voucher Bumper')
          return success(res, 200, newVoucherData)
        } else {
          return errors("Internal Error", 500)
        }

      } catch (e) {
        console.log(e)
        return errors(res, 500, e)
      }
    },

    //Get Voucher Api

    voucherFetch: async (req, res) => {

      /*  I have not used joi validation otherwise we can 
          allow only valid keys.
          Validation On keys like key will not be empty or follow particular pattern  
      */
      try {
        let searchQuery = {},
          email = req.query.email,
          status = req.query.status, // We can also use validation so that it can only accept valid status
          generationTimeTo = +(req.query.generationTimeTo),
          generationTimeFrom = +(req.query.generationTimeFrom)
        /* Appending condtion on basis on what basis we want filter request

          if Its email , status, genetionTim to from
        */

        if (email !== "''" && email !== undefined && email) {
          searchQuery = {
            ...searchQuery,
            ...{
              email: email
            }
          }
        }
        if (generationTimeTo !== undefined && generationTimeFrom !== undefined && generationTimeTo) {
          searchQuery = {
            ...searchQuery,
            ...{
              "generationTime": {
                $lte: generationTimeFrom
              },
              "generationTime": {
                $gte: generationTimeTo
              }
            }
          }
        }

        if (status !== "''" && status !== undefined && status) {
          searchQuery = {
            ...searchQuery,
            ...{
              status: status
            }
          }
        }

        let VoucherData = await Voucher.aggregate([{
          $match: searchQuery
        }])
        return success(res, 200, VoucherData, 'voucher data')

      } catch (e) {
        console.log(e)
        return errors(res, 500, e)
      }
    },

    voucherRedeem: async (req, res) => {

      /*  I have not used joi validation otherwise we can 
           allow only valid keys.
           Validation On keys like key will not be empty or follow particular pattern  
       */
      try {

        let value = req.body,
          email = value.email,
          couponCode = value.couponCode
        amountRdm = value.amount,
          searchQuery = {}
        pin = value.pin, // We can also use validation so that it can only accept valid status
          currentDay = new Date(),
          attemptTime = new Date()
        currentDay.setDate(currentDay.getDate() - 1)
        currentDay = currentDay.valueOf()
        attemptTime = attemptTime.setMinutes(attemptTime.getMinutes() - 10)
        attemptTime = attemptTime.valueOf()

        if (couponCode !== "''" && couponCode && pin !== "''" && pin) {
          searchQuery = {
            ...searchQuery,
            ...{
              code: couponCode
            }
          }
        }

        //findi if voucher is there with condtion
        let voucherDetails = await Voucher.aggregate([{
          $match: searchQuery
        }])

        //Getting coupon is present or not with valid with
        if (voucherDetails.length < 1) {
          return errors(res, 400, "Coupon Code is incorrect")
        }

        /* Filtering on condtion and according to them response

        Async 
        */

        // to make code sync
        const results = await Promise.all(voucherDetails)
        let voucherDetailsFilter = results.filter(data => {
          if (data.email !== email) {
            return errors(res, 400, "Email id is not valid for Redeem coupon ")
          } else if (data.pin !== pin) {
            return errors(res, 400, "Pin is not correct to Redeem coupon ")
          } else if (data.generationTime - currentDay < 0) {
            return errors(res, 400, "Coupon  is expired")
          } else if (data.amount < 0) {
            return errors(res, 400, "Coupon  is fully redeemed already")
          } else if (Math.sign(data.usageActivity) < 0) {
            return errors(res, 400, "Coupon  already utilized 5 times")
          } else if (data.amount < amountRdm) {
            return errors(res, 400, "Redeem coupon does not have sufficient amount")
          } else if (data.status === 'partiallyRedeemed' && (data.attemptTime - attemptTime) < 0) {
            return errors(res, 400, "Redeem it after 10 minutes")
          }
        })

        // Update collection voucher field 

        await Voucher.update({
          email: voucherDetails[0].email
        }, {
          $set: {
            "status": "partiallyRedeemed",
            "attemptTime": new Date().valueOf()
          },
          $inc: {
            "amount": -(amountRdm),
            "usageActivity": -1
          }
        })

        //fetching latest Voucher Details for particular couponCode
        let vuchrRdmSucss = await Voucher.aggregate([{
          $match: searchQuery
        }])

        appLogger.info(vuchrRdmSucss) // updating Voucher logs

        return success(res, 200, vuchrRdmSucss, 'Voucher data')
      } catch (e) {
        console.log(e)
        return errors(res, 500, e)
      }
    },

    //email Generate Template we could make helper 

    emailTemplate: async (message) => {
      return ` 
        <div style=max-width: 620px; margin: 0 auto; text-align: center; padding: 25px 0 0 0;">
          <div class="imgTemplate"></div>
      
          <h2 style="font-size: 28px;color: #222222;">
            You got the coupon!
          </h2>
      
          <p style="font-size: 20px; color: #6b727b;">
            ${message}
          </p>
        </div>`;
    },
  }
  return Object.freeze(methods)
}

module.exports = VoucherCtrl()
/** */
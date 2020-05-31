function userRoutes() {
  const ctrl = require('./voucher.controller')

  return (open, closed) => {
    closed.route('/voucher/create').post(ctrl.voucherCreate)
    open.route('/voucher/fetch').get(ctrl.voucherFetch)
    open.route('/voucher/redeem').post(ctrl.voucherRedeem)
  }
}
module.exports = userRoutes()
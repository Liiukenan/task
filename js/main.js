$(document).ready(function () {
    // 获取时间戳
    var time = new Date().getTime();
    var jid = 'anchor_1005393@bj2.1-1.io';
    function morse(str) {
        var jid = str;
        var _t = time + "";
        var BASE = "1RvGBwLLgd";
        var hash = md5(jid.slice(7) + _t.slice(-5));
        var i = hash.toString().toUpperCase();
        var n = i.slice(0, 10);
        var a = i.slice(-10);
        var s = '';
        var r = '';
        for (var x = 0; x < 7; x++) {
            s += n.charAt(x + 1) + _t.charAt(x);
            r += BASE.charAt(parseInt(_t.charAt(x + 2))) + a.charAt(x);
        }
        var e = s.slice(0, -1) + n.slice(-3);
        var p = a.slice(0, 3) + r.slice(1);
        return e + p;
    }
    for (let index = 0; index < $('.cont').length; index++) {
        var str = $($('.cont')[index]).text().toUpperCase();
        $($('.cont')[index]).text(str);
    }
    function getInfo() {
        var data = {
            jid: jid,
            _t: time,
            _c: morse(jid)
        }
        data = JSON.stringify(data);
        $.ajax({
            type: "post",
            url: "http://54.222.148.146:47000/common_service/checkin_task_reward_info",
            data: data,
            dataType: "json",
            success: function (response) {
                //是否签到
                var res = response.data;
                var weekIndex = new Date().getDay();
                if (weekIndex == 0) {
                    weekIndex = 7;
                }
                weekIndex = 7;
                for (let index = 0; index < $('.date').length; index++) {
                    var obj = res.signin_info[index];
                    $($('.money-num')[index]).html(obj.reward_num);
                    if (obj.sign_in) {
                        $($('.date')[index]).addClass('signed');
                        $('.check-disabled').show();
                        signLength++;
                    } else {
                        $($('.date')[index]).addClass('unsigned');
                        if (index == weekIndex - 1) {
                            $($('.date')[index]).addClass('gift').removeClass('unsigned');
                            check(index,obj.reward_num);
                        }
                    }
                    if (index > weekIndex) {
                        $($('.date')[index]).removeClass('signed');
                        $($('.date')[index]).removeClass('unsigned');
                    }
                }
                $('.weeknum').html( res.signin_info[7].reward_num);
                if (weekIndex == 7 && (res.signin_info[7].sign_in == true) && res.week_received_status==0) {
                    $('.claim-box').addClass('claim-box-active');
                    weekBtn(res.signin_info[7].reward_num);
                }
                for (var n = 0; n < $('.daily').length; n++) {
                    for (var x in res.daily_active_reward) {
                        if ($($('.daily')[n]).attr('data_title') == x) {
                            var mode = res.daily_active_reward[x];
                            var times = mode.schedule * 1000;
                            var minutes = parseInt((times % (1000 * 60 * 60)) / (1000 * 60));
                            var seconds = (times % (1000 * 60)) / 1000;
                            var str = ':'
                            var targetTime = mode.target_num;
                            var num = mode.schedule / targetTime;
                            $($('.fast-num')[n]).html(mode.reward_num);
                            if (mode.schedule > targetTime) {
                                mode.schedule = targetTime;
                            }
                            if (n == 0) {
                                if (seconds < 10) {
                                    str = ':0'
                                }
                                $($('.date-time')[n]).html(minutes + str + seconds);
                            } else {

                                $($('.date-time')[n]).html(mode.schedule + '/' + targetTime);
                            }
                            $($('.progress')[n]).width(num * 100 + "%");
                            if (num >= 1) {
                                $($('.go-mode')[n]).addClass('bg-purple').removeClass('border-pink');
                                if (mode.received_status == 1) {
                                    // 已领取
                                    $($('.go-mask')[n]).show().removeClass('bg-purple');
                                    $($('.progress')[n]).css('background', 'rgba(245,212,255,1)');
                                    $($('.go-mode')[n]).val('Claimed');

                                } else {
                                    // 未领取
                                    $($('.go-mode')[n]).val('Claim');
                                    reward(n,mode.reward_num);


                                }
                            } else {
                                // 跳转
                                $($('.go-mode')[n]).val('Go');
                                goApp(n)
                            }
                        }
                    }
                }
            }
        });
    }
    getInfo();
    // 刷新
    $(document).on('touchstart', '.refresh', function () {
        location.reload();
    })
    function reward(n,m) {
        var goMode = $($('.go-mode')[n]);
        goMode.on("touchstart", function (event) {
            event.preventDefault();
            var data = {
                type: 2,
                jid: jid,
                _t: time,
                _c: morse(jid)

            }
            if (n == 0) {
                data.task_type = 1
            }
            if (n == 1) {
                data.task_type = 2
            }
            if (n == 2) {
                data.task_type = 3
            }
            var _this = $(this);
            $.ajax({
                type: "post",
                url: "http://54.222.148.146:30000/account/checkin_get_reward",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (response) {
                    if (response.status == 1) {
                        $($('.go-mask')[n]).show().removeClass('bg-purple');
                        $($('.progress')[n]).css('background', 'rgba(245,212,255,1)');
                        _this.val('Claimed');
                        $('.get-gift').addClass('get-gift-active');
                        rewardBox(m);
                    }

                }
            });
        })
    }
    function check(n,m) {
        $('.check-btn').on("touchstart", function (e) {
            e.preventDefault();
            var data = {
                type: 1,
                jid: jid,
                _t: time,
                task_type: 4,
                _c: morse(jid)
            }
            $.ajax({
                type: "post",
                url: "http://54.222.148.146:30000/account/checkin_get_reward",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (response) {
                    if (response.status == 1) {
                        $('.check-disabled').show();
                        $($('.date')[n]).removeClass('gift').addClass('signed');
                        $('.get-gift').addClass('get-gift-active');
                        rewardBox(m);

                    }

                }
            });

        })
    }

    function goApp(n) {


    }
    function weekBtn(m) {
        $('.claim-btn input').on("touchstart", function (e) {
            e.preventDefault();
            var data = {
                type: 2,
                jid: jid,
                _t: time,
                task_type: 4,
                _c: morse(jid)
            }
            var _this=$(this);
            $.ajax({
                type: "post",
                url: "http://54.222.148.146:30000/account/checkin_get_reward",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (response) {
                    if (response.status == 1) {
                        $('.claim-box').removeClass('claim-box-active');
                        $('.claim-btn input').off();
                        $('.get-gift').addClass('get-gift-active');
                        rewardBox(m);
                    }

                }
            });
        })
    }
    $('.reward-btn button').on("touchstart",function(e){
        e.preventDefault();
        $('.get-gift').removeClass('get-gift-active');
    })
    function rewardBox(num){
        $('.reward-num').html(num);
    }







});
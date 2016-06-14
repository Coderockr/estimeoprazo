'use strict';

var Main = {};

Main = {
    init: function() {
        // Avoid `console` errors in browsers that lack a console.
        (function() {
            var method;
            var noop = function () {};
            var methods = [
                'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
                'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
                'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
                'timeStamp', 'trace', 'warn'
            ];

            var length = methods.length;
            var console = (window.console = window.console || {});

            while (length--) {
                method = methods[length];

                // Only stub undefined methods.
                if (!console[method]) {
                    console[method] = noop;
                }
            }
        }());

        $.easing['jswing'] = $.easing['swing'];

        $.extend($.easing, {
            def: 'easeOutQuad',
            easeInOutExpo: function (x, t, b, c, d) {
                if (t==0) return b;
                if (t==d) return b+c;
                if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        });

        $('*[data-autoscroll]').click(function(){
            var target = $(this.hash);

            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

            if (target.length) {
                $('html,body').animate({ scrollTop: target.offset().top }, 1500, 'easeInOutExpo');
                return false;
            }
        });

        $('.calculate').on('click', function() {
            var fields = {
                MinTasks: $('[name=MinTasks]'),
                MaxTasks: $('[name=MaxTasks]'),
                MinTasksDone: $('[name=MinTasksDone]'),
                MaxTasksDone: $('[name=MaxTasksDone]')
            };

            if (Main.validate(fields)) {
                var params = {
                    MinTasks: $('[name=MinTasks]').val(),
                    MaxTasks: $('[name=MaxTasks]').val(),
                    MinTasksDone: $('[name=MinTasksDone]').val(),
                    MaxTasksDone: $('[name=MaxTasksDone]').val(),
                    MinSplitTasks: 1,
                    MaxSplitTasks: 3
                }

                $(this).html('<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');

                var xhr = $.ajax({
                    method: 'POST',
                    url: 'https://planrockr-1306.appspot.com',
                    contentType: 'application/x-www-form-urlencoded',
                    data: $.param(params)
                }).done(function(data) {
                    if ($('html').attr('lang') == 'en') {
                        mixpanel.track("Project Forecaster: Results");
                    } else {
                        mixpanel.track("Estime o Prazo: Resultados");
                    }
                    Main.showResults(data);
                }).fail(function(xhr, ajaxOptions, thrownError) {
                    if ($('html').attr('lang') == 'en') {
                        var msg = "Ops! Wasn't possible estimate your project at this time. Please try again later.";
                    } else {
                        var msg = "Ops! Não foi possivel estimar seu projeto neste momento. Por favor, tente novamente mais tarde.";
                    }

                    alert(msg);
                });
            }
        });

        $('input').blur(function() {
            if ($(this).val() && $(this).val() <= 1000) {
                $(this).removeClass('error');
            } else {
                $(this).addClass('error');
            }
        }).keyup(function() {
            if ($(this).val() > 1000) {
                $(this).val(1000);
            }
        });
    },

    validate: function(fields) {
        var valid = true;

        $.each(fields, function(index, field) {
            if (!field.val()) {
                field.addClass('error');
                valid = false;
            }
        });

        return valid;
    },

    renderEstimatesTable: function(collection) {
        var tbody = '';

        $.each(collection.reverse(), function(index, estimate) {
            if (estimate.Likelihood >= 85) {
                tbody += '<tr class="probably">';
            } else if (estimate.Likelihood >= 50) {
                tbody += '<tr class="somewhat_probably">';
            } else {
                tbody += '<tr class="less_probably">';
            }
            tbody += '<td>' + estimate.Likelihood + '%</td>';
            tbody += '<td>' + estimate.Weeks + '</td></tr>';
        });

        $('tbody').html(tbody);
    },

    showResults: function(data) {
        Main.renderEstimatesTable(data);

        data = data.reverse()

        var initial = data[0].Weeks,
            final = data[data.length -1].Weeks;

        $('.initial').html(initial);
        $('.final').html(final);

        $('html,body').animate({ scrollTop: $('.results').offset().top }, 1500, 'easeInOutExpo');

        $('.dataGettering').addClass('hidden');
        $('.results').removeClass('hidden');
    }
}

$(document).ready(function() {
    Main.init();
});

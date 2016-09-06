// $(document).ready(function () {
//   $('[data-toggle="offcanvas"]').click(function () {
//     $('.row-offcanvas').toggleClass('active')
//   });
// });


Router.configure({
    loadingTemplate: 'loading',
});

Router.map(function() {
    return this.route('home', {
        path: '/',
        waitOn: function() {
        },
        action: function() {
            this.render('layout');
        }
    })
});

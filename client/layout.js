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
            // return Meteor.subscribe('malePeople');
        },
        action: function() {
            this.render('layout');
        }
    })
});


window.app = new Vue({
    el: '#app',
    router: new VueRouter({
        routes: []
    }),
    vuetify: new Vuetify({
        theme: { dark: false },
        light: {
            primary: '#00e591',
            secondary: '#b0bec5',
            accent: '#8c9eff',
            error: '#b71c1c',
          }
    }),
    props: {
        source: String
    },
    data: {
        // System alerts
        alerts: [],
        // Determines if loader is visible
        loader: {
            visible: false,
            message: "",
            processes: 0
        },
        app_loader: Vue.extend({ template: "<div></div>" }),
        app_navigator: Vue.extend({ template: "<div></div>" }),
        app_footer: Vue.extend({ template: "<div></div>" }),
        app_notifications: Vue.extend({ template: "<div></div>" }),
        APIManager: null
    },
    created() {
        // Initialize APIManager
        this.APIManager = new APIManager(this.loader);
        
        // Link components to APIManager
        APIManager.Loader.load((resolve, reject) => {
            app.app_notifications = APIManager.API.getComponent("notifications");
            app.app_loader = APIManager.API.getComponent("loader");
            app.app_navigator = APIManager.API.getComponent("navigator");
            app.app_footer = APIManager.API.getComponent("footer");
            app.$router.addRoutes(APIManager.routes);
            app.$router.push("/main");
            resolve(0);
        });
    },
    methods: {
    },
});
<script>
    module.exports = {
        data () {
            return {
                drawer: 1,
                pages: {}
            }
        },
        created () {
            window.nav_holder = this;
        },
        computed: {
            showNavBar: {
                get: function() {
                    return this.drawer > 0;
                },
                set: function(newValue) {
                    this.drawer = newValue;
                }
            }
        },
        methods: {
            toggleDarkTheme: function() {
                window.app.$vuetify.theme.dark = !(window.app.$vuetify.theme.dark);
            },
            isOnDarkMode: function () {
                return window.app.$vuetify.theme.dark;
            }
        }
    }
</script>

<template>
    <div>
        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click.stop="drawer = (drawer + 1) % 3"></v-app-bar-nav-icon>
            <v-toolbar-title>Shopping List System</v-toolbar-title>
            <v-btn class="lightbulb" icon large target="_blank" v-on:click="toggleDarkTheme()">
                <v-icon v-if="isOnDarkMode()">fas fa-lightbulb</v-icon>
                <v-icon v-else>fas fa-moon</v-icon>
            </v-btn>
        </v-app-bar>

        <v-navigation-drawer v-model="showNavBar" app clipped :mini-variant="drawer != 1">
            <v-list dense>
                <!-- Home option -->
                <v-list-item link to="/main">
                    <v-list-item-action>
                        <v-icon>fa fa-home</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            Main
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider class="my-2"></v-divider>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<style scoped>
/* Please style this crap, with style */
.lightbulb {
    position: absolute;
    right: 30px;
}
</style>
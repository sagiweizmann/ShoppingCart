<script>
    module.exports = {
        // This prop is used to allow updates from the root vue app
        props: {
            message: {
                type: String
            }
        },
        data () {
            return {
                drawer: null
            }
        },
        created () {
            
        }
    }
</script>

<template>
    <v-app class="loader">
        <v-content>
            <v-container fluid fill-height>
                <v-layout align-center justify-center>
                        <v-progress-circular :size="70" :width="7" color="blue-grey lighten-5" indeterminate></v-progress-circular>
                        <h3>{{ message }}</h3>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>

<style scoped>
/* Please style this crap, with style */
.v-progress-circular {
    margin: 1rem;
}

.loader {
    background: #7777777a !important;
    position: fixed;
    z-index: 100;
    width: 100%;
}
</style>
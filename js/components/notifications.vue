<script>
    module.exports = {
        // This prop is used to allow updates from the root vue app
        props: {
            alerts: {
                type: Array
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
        <v-app class="alert_container">
            <v-alert
                v-for="alert in alerts" :key="alert.id"
                :type="alert.color" :value="alert.show"
                :dismissible="alert.dismissible !== undefined && alert.dismissible" border="left">
                {{ alert.content }}
            </v-alert>
        </v-app>
</template>

<style scoped>
.alert_container {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: none !important;
}

/* Override stupid shit */
.alert_container > * {
    min-height: 0px !important;
    height: auto;
}
</style>

<script>
    module.exports = {
        data() {
            return {
                shopping_list: [],
                search: '',
                loader: {
                    visible: false,
                    message: "",
                    processes: 0
                },
                headers: [
                    { text: 'Name', value: 'name' },
                    { text: 'Quntity', value: 'quantity' },
                    { text: 'Price', value: 'price' },
                    { text: 'Description', value: 'description' },
                    { text: 'Basket', value: 'basket' },
                    { text: 'Actions', value: 'actions', sortable: false }
                ],
                in_edit: null,
                is_creating: false,
                delete_dialog: false,
                edit_dialog: false,
                discard_dialog: false
            }
        },
        created() {
            window.mhandler = this;
            this.updateShoppingList();            
        },
        methods: {
            updateShoppingList: function() {
                APIManager.API.request("getShoppingList", {}, function (response) {
                    if(response.status == APIManager.API.status_codes.SUCCESS) {
                        mhandler.shopping_list = Object.assign([], response.data);
                    } else {
                        APIManager.API.notify(response.data, "error");
                    }
                }, true);
            },
            createItem: function () {
                this.is_creating = true;
                this.edit_dialog = true;
                this.shopping_list.push({
                    name: '',
                    quntity: 0,
                    price: 0,
                    description: "",
                    basket: 0
                })
                this.in_edit = this.shopping_list.length - 1;
            },
            discard: function() {
                if(this.is_creating && !this.discard_dialog) {
                    this.discard_dialog = true;
                    return;
                }
                if(this.is_creating) this.is_creating = false;
                this.edit_dialog = false;
                this.discard_dialog = false;
            },
            save: function() {
                if(this.in_edit.name === "") {
                    APIManager.API.notify("Please fill in valid data", 'warning');
                    return;
                }
                
                APIManager.API.request("updateShoppingList", this.shopping_list, function(response) {
                    if(response.status === APIManager.API.status_codes.SUCCESS) {
                        APIManager.API.notify(response.data, 'success');
                    }
                    else {
                        APIManager.API.notify(response.data, 'error');
                    }
                });

                this.is_creating = false;
                this.edit_dialog = false;
                this.access_names = []; // Empty access names
                return;
            },
            editItem: function(item_id) {
                this.edit_dialog = true;
                this.in_edit = item_id;
            },
            removeItem: function(item_id) {
                this.shopping_list.splice(item_id, 1);

                APIManager.API.request("updateShoppingList", this.shopping_list, function(response) {
                    if(response.status === APIManager.API.status_codes.SUCCESS) {
                        APIManager.API.notify(response.data, 'success');
                    }
                    else {
                        APIManager.API.notify(response.data, 'error');
                    }
                });
                this.delete_dialog = false;
            }
        }
    };
</script>

<template>
<v-content>
        <v-container fluid fill-height>
        <v-data-table
            class="mx-auto ca_table" elevation-2 max-height="75%"
            :headers="headers"
            :items="shopping_list"
            :search="search">
            <template v-slot:top>
                <v-app-bar>
                    <v-toolbar-title>Shopping List</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        :loading="loader.visible"
                        :loading-text="loader.message"
                        hide-details></v-text-field>
                    <v-spacer></v-spacer>
                    <v-tooltip top>
                        <template #activator="{ on }">
                            <v-btn icon v-on="on" @click="createItem()">
                                <v-icon v-if="is_creating">mdi-close-circle</v-icon>
                                <v-icon v-else>mdi-plus-circle</v-icon>
                            </v-btn>
                        </template>
                        <span v-if="is_creating">Discard new item</span>
                        <span v-else>Add new item</span>
                    </v-tooltip>
                </v-app-bar>

                <!-- Edit/Add dialog -->
                <v-dialog v-if="edit_dialog" v-model="edit_dialog" max-width="500px">
                    <v-card>
                        <v-card-title><span class="headline">{{ (is_creating ? "Create" : "Edit") + " Item" }}</span></v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="shopping_list[in_edit].name" label="Item Name"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="shopping_list[in_edit].quantity" label="Quantity"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="shopping_list[in_edit].price" label="Price"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="6">
                                        <v-text-field v-model="shopping_list[in_edit].description" label="Description"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="save()">{{ is_creating ? "Add" : "Save" }}</v-btn>
                            <v-btn text @click="discard()">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Discard dialog -->
                <v-dialog v-model="discard_dialog" max-width="500px">
                    <v-card>
                        <v-card-title>Sure?</v-card-title>
                        <v-card-text>
                            You cannot revert changes you've discarded
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="discard()">Discard</v-btn>
                            <v-btn text @click="discard_dialog = false">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon @click="editItem(item)">
                    mdi-pencil-circle
                </v-icon>
                <!-- Delete dialog -->
                <v-dialog v-model="delete_dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                        <v-icon v-on="on" @click="removeItem(item.id)">
                            mdi-delete-circle
                        </v-icon>
                    </template>
                    <v-card>
                        <v-card-title>Sure?</v-card-title>
                        <v-card-text>
                            Really Really Sure?
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="removeItem(item.id)">Remove</v-btn>
                            <v-btn text @click="delete_dialog = false">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>
        </v-data-table>
        
        </v-container>
    </v-content>
</template>
<style scoped>
.ca_table {
    width: 90%;
}
</style>
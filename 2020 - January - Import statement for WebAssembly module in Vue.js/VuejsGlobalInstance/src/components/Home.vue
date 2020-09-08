<template>
    <div>
        <button @click="callAdd">Add</button>
        <p>Result: {{ result }}</p>
    </div>
</template>

<script>
    import Module from '../TestImport';

    export default {
        beforeCreate() {
            if (this.$myModule === null) {
                new Module().then(myModule => {
                    this.$myModule = myModule;
                });
            }
        },
        data() {
            return {
                result: null
            }
        },
        methods: {
            callAdd() {
                this.result = this.$myModule.ccall('Add',
                    'number',
                    ['number', 'number'],
                    [2, 3]);
            }
        }
    };
</script>

<style scoped>
</style>


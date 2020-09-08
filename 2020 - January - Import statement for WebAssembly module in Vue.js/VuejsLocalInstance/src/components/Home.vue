<template>
    <div>
        <button @click="callAdd">Add</button>
        <p>Result: {{ result }}</p>
    </div>
</template>

<script>
    import Module from '../TestImport';
    let moduleInstance = null;

    export default {
        beforeCreate() {
            new Module().then(myModule => {
                moduleInstance = myModule;
            });
        },
        data() {
            return {
                result: null
            }
        },
        methods: {
            callAdd() {
                this.result = moduleInstance.ccall('Add',
                    'number',
                    ['number', 'number'],
                    [2, 3]);
            }
        }
    };
</script>

<style scoped>
</style>
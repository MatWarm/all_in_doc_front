<template>

  <div v-if="userInfo">
    <Conversation :user="userInfo" @disconnection="disconnect"/>
  </div>
  <div style="background-color: #f1f5f9; position: absolute; inset: 0" v-else>
    <Login @login-status="connexion"/>
  </div>

</template>

<script>
import Conversation from './components/Conversation.vue'
import Login from './components/Login.vue'
export default {
  name: 'App',
  data() {
    return {
      userInfo : null
    };
  },
  components: {
    Conversation,
    Login
  },
  methods: {
    connexion(user) {
      this.userInfo = user;
    },
    disconnect(value) {
      console.log("app total")
      this.userInfo = value;
      window.location.reload();
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* Inclut padding et border dans la dimension totale des éléments */
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
}
</style>

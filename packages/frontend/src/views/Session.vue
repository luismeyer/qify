<template>
  <div class="container-with-reloader">
    <Reload :loading="sessionState.loading" />

    <div class="headline">
      <h1>Session</h1>

      <div class="links" v-if="!loading && sessionState.session">
        <router-link class="link" to="/settings"> Settings </router-link>
        <router-link class="link" to="/share"> Share with friends </router-link>
      </div>
    </div>

    <div v-if="!loading && sessionState.session">
      <ul>
        <User
          v-for="user in sessionState.session.users"
          :key="user.name"
          :user="user"
        />
      </ul>
    </div>

    <div v-if="loading || !sessionState.session" class="create-container">
      <img src="../assets/session.png" />
      <button class="create" @click="handleCreate">Create Session</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import User from "../components/User.vue";
import Reload from "../components/Reload.vue";

import { useState, useStore } from "../store";

export default defineComponent({
  components: {
    User,
    Reload,
  },

  setup() {
    const { session } = useState();
    const store = useStore();

    const loadSession = () => {
      return store.dispatch("fetchData");
    };

    loadSession();

    return {
      handleCreate: () => store.dispatch("createSession"),
      handleLeave: () => store.dispatch("leaveSession"),
      fetch: loadSession,
      sessionState: computed(() => session),
      loading: computed(() => !session.session && session.loading),
    };
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 8px;
  margin-top: 16px;
}

.headline {
  display: grid;
  justify-content: center;
  margin-bottom: 16px;
}

.create-container {
  position: relative;
}

.create {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 32px;
  background-color: white;
  border-radius: 8px;
  border: none;
  color: black;
  font-size: 24px;
  box-shadow: rgb(0 0 0) 0px 6px 10px;
  width: max-content;
  cursor: pointer;
}

ul {
  display: grid;
  grid-gap: 24px;
  justify-items: start;
  padding: 0;
  list-style: none;
}

.links {
  display: grid;
  grid-auto-flow: column;
  grid-gap: 24px;
}

.container {
  display: grid;
  justify-items: center;
}

img {
  max-width: 100%;
}
</style>

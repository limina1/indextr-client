<script lang="ts">
	export let username: string = '';
	export let password: string = '';

	function handleSubmit() {
		console.log('Username:', username);
		console.log('Password:', password);
	}
</script>

<div class="Login">
	<form on:submit|preventDefault={handleSubmit}>
		<label>
			nsec:
			<input type="text" bind:value={username} />
		</label>
		<br />
		<!-- <label>
			 Password:
			 <input type="password" bind:value={password} />
			 </label> -->
		<br />
		<button type="submit">Login</button>
	</form>
</div>

<style>
	.Login {
		display: flex;
		justify-content: center;
		align-items: center;
		/* height: 100vh; */
		width: 100vw;
	}
</style>

<script lang="ts">
	export let title: string = '';
	export let href: string = '#';
</script>

<a href="/{href}">
	<div class="ArticleHeader">
		<h2>{title}</h2>
	</div>
</a>

<style>
	.ArticleHeader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		border: 1px solid purple;
		border-radius: 10px;
		padding: 5px;
		border-top-width: 5px;
	}
	.ArticleHeader h2 {
		font-size: 1.5rem;
	}
</style>

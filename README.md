# indextr

indextr is a Nostr-native wiki client built for Distributed Collective Knowledge Management.

This is still under development. Read more [here](https://github.com/limina1/indextr-principles/tree/main).

### Roadmap

- Optimization (current iteration does keep articles stored when going to previous page)
- Supporting different article types. Accepting pull requests. Within the tags of kind 30041 have a ["type", <type>] where <type> is the article for display. Some examples - Recipes, notebook, flashcard, vocabulary etc.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

# Add examples
So you’ve decided to add a new example and help the community! good! This is how you should go about it. Remember we are using [preact](https://preactjs.com/) function components.
 
```bash
pnpm run create:example
```
Then add your signature/link to your social in `src/page/Examples.tsx` in your corresponding example entry.

## The thumbnail
Create a square `.webp` image representing your example. Try to ake it very light like 1 digit Kb and use some AI to keep the style of the thumbnails already in use. A good prompt is ( *replace XXXXX with a description of your example*)

```
create a fully square icon for an application about XXXXX. Make the background black and the isotype white with a simplistic style, preferably thick lines and minimalist.
```
put the file in `public/thumbnails/` prefix the name with `example-`
 


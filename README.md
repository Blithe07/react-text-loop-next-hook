## react-text-loop-next-hook

Fork from `react-text-loop-next`. Upgrade to hooks component.

---

## Installation

`npm install react-text-loop-next-hook` or `yarn add react-text-loop-next-hook`

### Usage

```jsx
import { TextLoop } from "react-text-loop-next-hook";

const App = () => {
  return (
    <h2>
      <TextLoop>
        <span>First item</span>
        <a href="/">Second item</a>
        <p style={{ color: "red" }}>Third item</p>
      </TextLoop>{" "}
      and something else.
    </h2>
  );
};
```

### Props

| Prop           | Type            | Default                           | Definition                                                                                                                                                     |
| -------------- | --------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| interval       | number \| array | `3000`                            | The frequency (in ms) that the words change. Can also pass an array if you want a different interval per children                                              |
| delay          | number          | `0`                               | A delay (in ms) for the animation to start. This allows to use multiple instances to create a staggered animation effect for example.                          |
| adjustingSpeed | number          | `150`                             | The speed that the container around each word adjusts to the next one (in ms). Usually you don't need to change this.                                          |
| fade           | boolean         | `true`                            | Enable or disable the fade animation on enter and leave                                                                                                        |
| mask           | boolean         | `false`                           | Mask the animation around the bounding box of the animated content                                                                                             |
| noWrap         | boolean         | `true`                            | Disable `whitepace: nowrap` style for each element. This is used by default so we can always get the right width of the element but can have issues sometimes. |
| springConfig   | object          | `{ stiffness: 340, damping: 30 }` | Configuration for [react-motion spring](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig)                  |
| className      | string          |                                   | Any additional CSS classes you might want to use to style the image                                                                                            |
| children       | node            |                                   | The words you want to loop (required)                                                                                                                          |

### Caveats

Because `<TextLoop>` loops through its children nodes, only root-level nodes will be considered so
doing something like:

```jsx
<TextLoop>
  <div>
    <span>First item</span>
    <span>Second item</span>
  </div>
  <div>Third item</div>
</TextLoop>
```

will make first and second item to be treated as one and animate together.

You can also just send a normal array as children prop if you don't need any individual styling for
each node.

```jsx
<TextLoop
  children={[
    "Trade faster",
    "Increase sales",
    "Stock winners",
    "Price perfectly",
  ]}
/>
```

## Examples

### Fast transition

![text-loop-fast-small](https://cloud.githubusercontent.com/assets/38172/24275301/5d48c6e2-1026-11e7-85b8-e7cfe07f4714.gif)

```jsx
<TextLoop interval={100}>...</TextLoop>
```

### Wobbly animation

![text-loop-bouncy](https://cloud.githubusercontent.com/assets/38172/24275347/b0e45b2c-1026-11e7-8e04-04bdafdef249.gif)

```jsx
<TextLoop springConfig={{ stiffness: 180, damping: 8 }}>...</TextLoop>
```

For many other examples, please have a look at the [react-text-loop-next][https://github.com/samarmohan/react-text-loop-next].

## License

[MIT](https://github.com/blithe07/react-text-loop-next-hook/blob/master/LICENSE)

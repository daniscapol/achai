# Animation Components

This directory contains animation components for the AchaAI MCP Marketplace website.

## TypeWriter Component

The `TypeWriter` component creates a typing and deleting animation effect commonly used to make text more dynamic and engaging. This component follows the project's animation patterns and integrates with the existing design system.

### Features

- **Text Cycling**: Types and deletes an array of text strings sequentially
- **Customizable Speeds**: Configure typing speed, deleting speed, and delays
- **Accessibility**: Supports reduced motion preferences
- **Customizable Cursor**: Default blinking cursor can be customized
- **Styling Flexibility**: Works with any text styling including gradients

### Usage

```jsx
import { TypeWriter } from './components/animations';

// Basic usage
<TypeWriter 
  texts={["First message", "Second message", "Third message"]} 
/>

// Advanced usage with all options
<TypeWriter 
  texts={[
    "Find the perfect MCP server for your project",
    "Enhance Claude with powerful tools",
    "Connect to databases, APIs, and more"
  ]}
  typingSpeed={70}         // Speed of typing in ms
  deletingSpeed={40}       // Speed of deleting in ms
  delayAfterType={2000}    // Pause after typing complete in ms
  delayAfterDelete={700}   // Pause after deleting in ms
  loop={true}              // Whether to loop through texts
  className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-400"
  cursor={<span className="animate-blink-cursor text-purple-500">▌</span>}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `texts` | string[] | ['Default text'] | Array of text phrases to cycle through |
| `typingSpeed` | number | 100 | Speed of typing animation in milliseconds |
| `deletingSpeed` | number | 50 | Speed of deleting animation in milliseconds |
| `delayAfterType` | number | 1500 | Delay after typing is complete in milliseconds |
| `delayAfterDelete` | number | 500 | Delay after deleting is complete in milliseconds |
| `loop` | boolean | true | Whether to loop through the texts continuously |
| `className` | string | '' | Additional CSS classes to apply to the container |
| `cursor` | ReactNode | `<span className="animate-blink-cursor">|</span>` | Custom cursor element |

### Integration

The TypeWriter component can be used in various sections of the website to add visual interest:

1. **Hero sections**: Replace static taglines with dynamic typing messages
2. **Section headers**: Create dynamic headings that cycle through related concepts
3. **Feature highlights**: Draw attention to key capabilities or statistics
4. **Calls to action**: Make button descriptions or promotional text more engaging

The component automatically respects users' reduced motion preferences by showing static text instead of animations when necessary.

### Implementation Notes

- Uses `useCallback` and proper cleanup to prevent memory leaks
- Properly handles edge cases (empty text array, reduced motion, etc.)
- Uses the `blink-cursor` animation defined in the project's tailwind.config.js
- Maintains accessibility with aria-live attribute for screen readers
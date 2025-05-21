# TypeWriter Component Integration Guide

This guide shows how to integrate the new TypeWriter component into the HomePage. The component creates a typing and deleting effect for text, enhancing the interactive feel of the interface.

## HomePage Integration

To integrate the TypeWriter component into the HomePage's hero section, locate the section starting around line 434-442:

```jsx
<ScrollReveal direction="down" once={true}>
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter">
    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
      MCP Marketplace
    </span>
  </h1>
  <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
    Find the perfect Model Context Protocol servers to enhance Claude's capabilities and extend your AI workflows.
  </p>
  <!-- ... buttons ... -->
</ScrollReveal>
```

Replace the paragraph with the TypeWriter component:

```jsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter">
  <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
    MCP Marketplace
  </span>
</h1>
<div className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
  <TypeWriter 
    texts={[
      "Find the perfect MCP servers to enhance Claude's capabilities.",
      "Extend your AI workflows with powerful tools and data sources.",
      "Connect Claude to databases, APIs, and specialized services.",
      "Discover new capabilities for your AI applications."
    ]}
    typingSpeed={70}
    deletingSpeed={30}
    delayAfterType={2000} 
    delayAfterDelete={500}
  />
</div>
```

## Modified Import Statement

Update the import section at the top of HomePage.jsx:

```jsx
import { 
  ScrollReveal, 
  ParallaxEffect, 
  EnhancedButton,
  prefersReducedMotion,
  TypeWriter
} from './animations';
```

## Alternative Integration - Replace "Popular Categories" Heading

Another option is to make the "Popular Categories" heading more dynamic. Locate the section around line 550:

```jsx
<div className="mb-8 flex justify-between items-center">
  <h2 className="text-3xl font-bold text-white">Popular Categories</h2>
  <EnhancedButton 
    onClick={onNavigateToCategories} 
    variant="ghost" 
    size="sm"
  >
    View All Categories
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </EnhancedButton>
</div>
```

Replace with:

```jsx
<div className="mb-8 flex justify-between items-center">
  <h2 className="text-3xl font-bold text-white flex items-center">
    <TypeWriter 
      texts={[
        "Popular Categories",
        "Trending Tools",
        "Discover Servers",
        "AI Extensions"
      ]}
      typingSpeed={70}
      deletingSpeed={40}
      delayAfterType={3000}
      delayAfterDelete={700}
    />
  </h2>
  <EnhancedButton 
    onClick={onNavigateToCategories} 
    variant="ghost" 
    size="sm"
  >
    View All Categories
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </EnhancedButton>
</div>
```

## How It Works

The TypeWriter component:

1. Takes an array of text strings that will be typed and deleted sequentially
2. Controls typing and deleting speeds through props
3. Sets delays after typing and after deleting
4. Uses the blink-cursor animation for a realistic typing effect
5. Automatically disables animations for users who prefer reduced motion
6. Works with any text styling, including gradients and custom colors

You can customize the texts, speeds, and delays to fit the desired effect for different sections of the application.
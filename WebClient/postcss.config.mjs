const config = {
  plugins: [
    "@tailwindcss/postcss",
    "postcss-preset-mantine",
    "postcss-simple-vars",
  ],
};

// Adding postcss-simple-vars configuration
config.plugins.push({
  "postcss-simple-vars": {
    variables: {
      "mantine-breakpoint-xs": "36em",
      "mantine-breakpoint-sm": "48em",
      "mantine-breakpoint-md": "62em",
      "mantine-breakpoint-lg": "75em",
      "mantine-breakpoint-xl": "88em",
    },
  },
});

export default config;

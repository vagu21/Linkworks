import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    // "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // Tremor module
  ],

  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '19px'],
      base: ['16px', '21px'],
      lg: ['18px', '22px'],
      xl: ['20px', '24px'],
      '2xl': ['24px', '29px'],
      '3xl': ['28px', '34px'],
      '4xl': ['32px', '40px'],
      '5xl': ['36px', '45px'],
 
      'h1': ['36px', '45px'],
      'h2': ['32px', '40px'],
      'h3': ['28px', '34px'],
      'h4': ['24px', '29px'],
      'h5': ['20px', '24px'],
      'sub-heading-1': ['18px', '22px'],
      'sub-heading-2': ['16px', '21px'],
      'body': ['14px', '19px'],
      'small': ['12px', '16px'],
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(90deg, #FFFAF6 0%, #FFF7F6 100%)',
        'AI-gradient': 'linear-gradient(90deg, #FF7800 0%, #FFA200 100%)',
      },
      colors: {
        border: {
          DEFAULT:"hsl(var(--border))",
          subtle:"hsl(var(--border-subtle))",
          dark:"hsl(var(--border-dark))",
          lighter:"hsl(var(--border-lighter))",
          label:"hsl(var(--label))",
          relation:"#FFDBCD",
        },
        gradientStart: '#FFFAF6',
        gradientEnd: '#FFF7F6',
        relationTitle:"#180505",
        cardBg:"#FAFAFA",
        cardBorder:"#EAEAEA",
        selectRelationBtn:"#FF7800",
        input: "hsl(var(--input))",
        ring: {
          DEFAULT:"hsl(var(--ring))",
          secondary:"hsl(var(--ring-secondary))",
        },
        background:{
          DEFAULT:"hsl(var(--background))",
          subtle:"hsl(var(--background-subtle))",
          disabled:"hsl(var(--background-disabled))",
          disabledLight:"hsl(var(--background-disabledLight))"
        },

        label:"hsl(var(--label))",
  

        text: {
          DEFAULT:"hsl(var(--text))",
          body:"hsl(var(--text-body))",
          subtitle:"hsl(var(--text-subtitle))",
          caption:"hsl(var(--text-caption))",
          negative:"hsl(var(--text-negative))",
          disabled:"hsl(var(--text-disabled))",
        },
          
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          border: "hsl(var(--primary-border))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          border: "hsl(var(--secondary-border))",
        },
        tertiary:{
                DEFAULT: "hsl(var(--tertiary))",
                foreground: "hsl(var(--tertiary-foreground))",
                border: "hsl(var(--tertiary-border))",
                lighter:"hsl(var(--tertiary-lighter))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          border:"hsl(var(--destructive-border))"
        },
        disbaled:{
         DEFAULT: "hsl(var(--disabled))",
         border: "hsl(var(--disabled-border))",
         foreground: "hsl(var(--disabled-foreground))",
        },
        navBar: "#3B82F6",
        navBarHover: "#2D58C0",
        onSelect: "#0c4a6e",
        inputFieldLabel:"#151B21",
        inputFieldStroke:"#D9D9D9",
        invalidInput:"#FF5555",
        inputEmailIcon:"#151B21",
        inputEmailIconBg:"rgba(21, 27, 33, 0.02)",
        // warning:"#FAAD14",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        error:{
          DEFAULT:"hsl(var(--error))"
        },

        warning:{
             DEFAULT:"hsl(var(--warning))"
        },

        chip:{
          DEFAULT: "hsl(var(--chip))",
          selected: "hsl(var(--chip-selected))",
          border: "hsl(var(--chip-border))",
          text: "hsl(var(--chip-text))",
          icon: "hsl(var(--chip-icon))",
          placeholder: "hsl(var(--chip-placeholder))",
        },
        theme: {
          50: colors.violet[50],
          100: colors.violet[100],
          200: colors.violet[200],
          300: colors.violet[300],
          400: colors.violet[400],
          500: colors.violet[500],
          600: colors.violet[600],
          700: colors.violet[700],
          800: colors.violet[800],
          900: colors.violet[900],
        },
        // light mode
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: "#131A2B",
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "background-position-spin": {
          "0%": { backgroundPosition: "top center" },
          "100%": { backgroundPosition: "bottom center" },
        },
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        backgroundPositionSpin: "background-position-spin 3000ms infinite alternate",
        scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.400"),
            "h2, h3, h4, thead th": {
              color: theme("colors.gray.200"),
            },
            "h2 small, h3 small, h4 small": {
              color: theme("colors.gray.400"),
            },
            code: {
              color: theme("colors.gray.200"),
            },
            hr: {
              borderColor: theme("colors.gray.200"),
              opacity: "0.05",
            },
            pre: {
              boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.1)",
            },
            a: {
              color: theme("colors.white"),
              borderBottomColor: theme("colors.sky.400"),
            },
            strong: {
              color: theme("colors.gray.200"),
            },
            thead: {
              color: theme("colors.gray.300"),
              borderBottomColor: "rgb(148 163 184 / 0.2)",
            },
            "tbody tr": {
              borderBottomColor: "rgb(148 163 184 / 0.1)",
            },
          },
        },
      }),
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
        "heading-1-regular": ["36px", { lineHeight: "45px", fontWeight: "400" }],
        "heading-1-medium": ["36px", { lineHeight: "45px", fontWeight: "500" }],
        "heading-1-semibold": ["36px", { lineHeight: "45px", fontWeight: "600" }],
        "heading-1-bold": ["36px", { lineHeight: "45px", fontWeight: "700" }],
        "heading-2-regular": ["32px", { lineHeight: "40px", fontWeight: "400" }],
        "heading-2-medium": ["32px", { lineHeight: "40px", fontWeight: "500" }],
        "heading-2-semibold": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "heading-2-bold": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "heading-3-regular": ["28px", { lineHeight: "34px", fontWeight: "400" }],
        "heading-3-medium": ["28px", { lineHeight: "34px", fontWeight: "500" }],
        "heading-3-semibold": ["28px", { lineHeight: "34px", fontWeight: "600" }],
        "heading-3-bold": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "heading-4-regular": ["24px", { lineHeight: "29px", fontWeight: "400" }],
        "heading-4-medium": ["24px", { lineHeight: "29px", fontWeight: "500" }],
        "heading-4-semibold": ["24px", { lineHeight: "29px", fontWeight: "600" }],
        "heading-4-bold": ["24px", { lineHeight: "29px", fontWeight: "700" }],
        "heading-5-regular": ["20px", { lineHeight: "24px", fontWeight: "400" }],
        "heading-5-medium": ["20px", { lineHeight: "24px", fontWeight: "500" }],
        "heading-5-semibold": ["20px", { lineHeight: "24px", fontWeight: "600" }],
        "heading-5-bold": ["20px", { lineHeight: "24px", fontWeight: "700" }],
        "body-regular": ["14px", { lineHeight: "19px", fontWeight: "400" }],
        "body-medium": ["14px", { lineHeight: "19px", fontWeight: "500" }],
        "body-semibold": ["14px", { lineHeight: "19px", fontWeight: "600" }],
        "body-bold": ["14px", { lineHeight: "19px", fontWeight: "700" }],
        "small-regular": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "small-medium": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "small-semibold": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "small-bold": ["12px", { lineHeight: "16px", fontWeight: "700" }],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwindcss-animate"),
  ],
} satisfies Config;

export default config;

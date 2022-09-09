import { ThemeProvider, StylesProvider } from '@mui/styles'
import { theme } from './theme'

type UIProviderProps = {
  children: React.ReactNode
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StylesProvider>
  )
}

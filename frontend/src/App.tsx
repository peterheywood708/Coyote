import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  createTheme,
  NavLink,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import { FaRegFileAudio, FaTableList } from "react-icons/fa6";
import { BrowserRouter, Routes, Route } from "react-router";
import Transcribe from "./pages/transcribe";
import Transcriptions from "./pages/transcriptions";
import { useAuth } from "react-oidc-context";

const theme = createTheme({
  colors: {
    "ocean-blue": [
      "#7AD1DD",
      "#5FCCDB",
      "#44CADC",
      "#2AC9DE",
      "#1AC2D9",
      "#11B7CD",
      "#09ADC3",
      "#0E99AC",
      "#128797",
      "#147885",
    ],
  },
});

function App() {
  const auth = useAuth();
  const [opened, { toggle }] = useDisclosure();

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_AWS_CLIENTID;
    const logoutUri = "/";
    const cognitoDomain = import.meta.env.VITE_AWS_COGNITODOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <img src="logo.png" alt="Click here to return home" height="32" />
            <Group h="100%" px="md">
              <Button
                variant="filled"
                color="ocean-blue"
                onClick={() => auth.signinRedirect()}
              >
                Sign in
              </Button>
              <Button variant="outline" color="ocean-blue">
                Sign up
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          {" "}
          <NavLink
            href="/"
            label="Transcribe audio"
            leftSection={<FaRegFileAudio />}
          />
          <NavLink
            href="/transcriptions"
            label="View transcriptions"
            leftSection={<FaTableList />}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          {auth.isAuthenticated ? (
            <>
              <pre> Hello: {auth.user?.profile.email} </pre>
              <pre> ID Token: {auth.user?.id_token} </pre>
              <pre> Access Token: {auth.user?.access_token} </pre>
              <pre> Refresh Token: {auth.user?.refresh_token} </pre>

              <Button
                variant="outline"
                color="ocean-blue"
                onClick={() => auth.removeUser()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>Not logged in</>
          )}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Transcribe />}></Route>
              <Route
                path="/transcriptions"
                element={<Transcriptions />}
              ></Route>
            </Routes>
          </BrowserRouter>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

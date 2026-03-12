import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  createTheme,
  NavLink,
  Button,
  Title,
  Flex,
  Space,
  Text,
  Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import { FaRegFileAudio, FaTableList } from "react-icons/fa6";
import { BrowserRouter, Routes, Route } from "react-router";
import Upload from "./pages/upload";
import Transcriptions from "./pages/transcriptions";
import Transcription from "./pages/transcription";
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
    coyote: [
      "#fff4e1",
      "#ffe8cc",
      "#fed09b",
      "#fdb766",
      "#fca13a",
      "#fc931d",
      "#fc8a08",
      "#e17800",
      "#c86a00",
      "#af5a00",
    ],
  },
});

function App() {
  const auth = useAuth();
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        withBorder={false}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Flex align="center" wrap="wrap">
              <Text
                size="xl"
                fw={600}
                variant="gradient"
                gradient={{ from: "yellow", to: "orange", deg: 90 }}
              >
                Coyote
              </Text>
            </Flex>

            <Group h="100%" px="md">
              {auth.isAuthenticated ? (
                <>
                  {auth.user?.profile.email}
                  <Button
                    variant="outline"
                    color="coyote"
                    onClick={() => auth.removeUser()}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="filled"
                    color="coyote"
                    onClick={() => auth.signinRedirect()}
                  >
                    Sign in
                  </Button>
                  <Button variant="outline" color="coyote">
                    Sign up
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </AppShell.Header>
        {auth.isAuthenticated ? (
          <>
            <AppShell.Navbar p="md">
              <NavLink
                href="/"
                label="Upload audio"
                leftSection={<FaRegFileAudio />}
              />
              <NavLink
                href="/transcriptions"
                label="View transcriptions"
                leftSection={<FaTableList />}
              />
            </AppShell.Navbar>
            <AppShell.Main>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Upload />}></Route>
                  <Route
                    path="/transcriptions"
                    element={<Transcriptions />}
                  ></Route>
                  <Route
                    path="/transcription"
                    element={<Transcription />}
                  ></Route>
                </Routes>
              </BrowserRouter>
            </AppShell.Main>
          </>
        ) : (
          <>
            <Avatar
              src="/images/coyote.png"
              size={200}
              radius={200}
              mx="auto"
              variant="outline"
            />
            <Space h="xl" />
            <Title order={1} fw={400}>
              Welcome to Coyote
            </Title>
            <Space h="md" />
            <Title order={3} fw={400}>
              Transcription and speech diarization made easy
            </Title>
          </>
        )}
      </AppShell>
    </MantineProvider>
  );
}

export default App;

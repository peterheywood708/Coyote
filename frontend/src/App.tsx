import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  createTheme,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import { FaRegFileAudio, FaTableList } from "react-icons/fa6";
import { BrowserRouter, Routes, Route } from "react-router";
import Transcribe from "./pages/transcribe";
import Transcriptions from "./pages/transcriptions";

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
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <img src="logo.png" alt="Click here to return home" height="32" />
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

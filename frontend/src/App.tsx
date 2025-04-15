import {
  AppShell,
  Burger,
  FileButton,
  Button,
  Group,
  Text,
  Space,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Object | null>(null);

  useEffect(() => {
    if (file) {
      alert(file?.name);
    }
  }, [file]);

  return (
    <MantineProvider>
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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>
            <h2>Coyote</h2>
          </div>
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

        <AppShell.Main>
          Upload and transcribe audio
          <Space h="md" />
          <Group justify="center">
            <FileButton onChange={setFile} accept="audio/mp3,audio/wav">
              {(props) => <Button {...props}>Upload audio</Button>}
            </FileButton>
          </Group>
          {file && (
            <>
              <Text size="sm" ta="center" mt="sm">
                Selected file: {file.name}
              </Text>
            </>
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

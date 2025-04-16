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
import { MantineProvider, Container, Loader } from "@mantine/core";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Object | null>(null);
  const [loading, setLoading] = useState<Boolean>(false);

  useEffect(() => {
    const GetData = async () => {
      if (file) {
        setLoading(true);
        let formData: FormData = new FormData();
        formData.append("file", file);
        let response: Response = await fetch(
          "http://localhost:3000/transcribe",
          {
            method: "POST",
            body: formData,
          }
        );
        const body: Response = await response.json();
        console.log(body);
        setData(body);
        setLoading(false);
      }
    };
    GetData();
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
          <div>Coyote</div>
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

        <AppShell.Main>
          Select an audio file by clicking the upload button below. Only mp3 and
          wav files are supported.
          <Space h="md" />
          {!loading ? (
            !data ? (
              <Container fluid bg="var(--mantine-color-blue-light)">
                {" "}
                <Space h="md" />
                <Group justify="center">
                  <FileButton onChange={setFile} accept="audio/mp3,audio/wav">
                    {(props) => (
                      <Button {...props}>
                        {file ? file.name : "Upload audio"}
                      </Button>
                    )}
                  </FileButton>
                </Group>
                <Space h="md" />
              </Container>
            ) : (
              <>Transcript: {data?.text}</>
            )
          ) : (
            <Loader color="blue" />
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

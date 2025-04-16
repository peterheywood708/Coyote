import {
  AppShell,
  Burger,
  FileButton,
  Button,
  Group,
  Paper,
  Space,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import {
  MantineProvider,
  Loader,
  Text,
  Flex,
  createTheme,
} from "@mantine/core";

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

interface IData {
  text: string;
}

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<IData | null>(null);
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
        const body: IData = await response.json();
        console.log(body);
        setData(body);
        setLoading(false);
      }
    };
    GetData();
  }, [file]);

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
            <img src="logo.png" alt="Click here to return home" />
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

        <AppShell.Main>
          <Paper shadow="xs" p="xl">
            {!loading ? (
              !data ? (
                <>
                  Select an audio file by clicking the upload button below. Only
                  mp3 and wav files are supported.
                  <Space h="md" />
                  <Group justify="center">
                    <FileButton onChange={setFile} accept="audio/mp3,audio/wav">
                      {(props) => (
                        <Button color="ocean-blue" {...props}>
                          {file ? file.name : "Upload audio"}
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                  <Space h="md" />
                </>
              ) : (
                <>
                  <Text size="xl" ta="left">
                    Transcription
                  </Text>
                  <Space h="md" />
                  <Text ta="left">{data?.text}</Text>
                  <Space h="md" />
                  <Flex
                    gap="md"
                    justify="flex-start"
                    align="flex-start"
                    direction="row"
                    wrap="wrap"
                  >
                    <Button color="ocean-blue">Back</Button>
                    <Button color="ocean-blue">Save</Button>
                  </Flex>
                </>
              )
            ) : (
              <Loader color="blue" />
            )}
          </Paper>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

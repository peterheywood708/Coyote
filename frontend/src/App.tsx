import {
  AppShell,
  Burger,
  FileButton,
  Button,
  Group,
  Paper,
  Space,
  MantineProvider,
  Loader,
  Text,
  Flex,
  createTheme,
  NavLink,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import "./App.css";
import "@mantine/core/styles.css";
import { FaCircleCheck, FaRegFileAudio, FaTableList } from "react-icons/fa6";

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

interface IResponse {
  acknowledged: boolean;
  insertedId: string;
}

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<IData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcriptSaved, setTranscriptSaved] = useState<boolean>(false);

  const SendTranscript = async () => {
    setLoading(true);
    const transcriptResponse: Response = await fetch(
      `${import.meta.env.VITE_DB_ENDPOINT}/store`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const response: IResponse = await transcriptResponse.json();
    if (response?.acknowledged) {
      setTranscriptSaved(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    const GetData = async () => {
      if (file) {
        setLoading(true);
        const formData: FormData = new FormData();
        formData.append("file", file);
        const response: Response = await fetch(
          `${import.meta.env.VITE_AI_ENDPOINT}/transcribe`,
          {
            method: "POST",
            body: formData,
          }
        );
        const body: IData = await response.json();
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
            <img src="logo.png" alt="Click here to return home" height="32" />
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          {" "}
          <NavLink
            href="#required-for-focus"
            label="Transcribe audio"
            leftSection={<FaRegFileAudio />}
          />
          <NavLink
            href="#required-for-focus"
            label="View transcriptions"
            leftSection={<FaTableList />}
          />
        </AppShell.Navbar>

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
                    <Button color="ocean-blue">View transcriptions</Button>
                    <Button
                      color="ocean-blue"
                      disabled={transcriptSaved}
                      onClick={() => SendTranscript()}
                    >
                      {transcriptSaved ? (
                        <>
                          <FaCircleCheck />
                          &nbsp;Transcript saved
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
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

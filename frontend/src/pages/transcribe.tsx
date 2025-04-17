import { useState, useEffect } from "react";
import {
  FileButton,
  Button,
  Group,
  Paper,
  Space,
  Loader,
  Text,
  Flex,
} from "@mantine/core";
import { FaCircleCheck } from "react-icons/fa6";

interface IData {
  text: string;
}

interface IResponse {
  acknowledged: boolean;
  insertedId: string;
}

const Transcribe = () => {
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
    <>
      <Paper shadow="xs" p="xl">
        {!loading ? (
          !data ? (
            <>
              Select an audio file by clicking the upload button below. Only mp3
              and wav files are supported.
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
    </>
  );
};

export default Transcribe;

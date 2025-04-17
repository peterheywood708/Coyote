import { useState, useEffect } from "react";
import {
  FileButton,
  Button,
  Group,
  Alert,
  Space,
  Loader,
  Text,
  Flex,
  Paper,
} from "@mantine/core";
import { FaCircleCheck, FaCircleInfo } from "react-icons/fa6";
import { useNavigate } from "react-router";

interface IData {
  text: string;
}

interface IResponse {
  acknowledged: boolean;
  insertedId: string;
}

const Transcribe = () => {
  let navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<IData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcriptSaved, setTranscriptSaved] = useState<boolean>(false);
  const [transcribeError, setTranscribeError] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<boolean>(false);

  const SendTranscript = async () => {
    setLoading(true);
    setStoreError(false);
    try {
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
    } catch (err) {
      console.warn(err);
      setStoreError(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const GetData = async () => {
      if (file) {
        try {
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
        } catch (err) {
          setTranscribeError(true);
          console.warn(err);
          setLoading(false);
        }
      }
    };
    GetData();
  }, [file]);

  return (
    <>
      <Text size="xl">Transcribe audio</Text>
      <Space h="md" />
      {!loading ? (
        !data ? (
          <>
            Select an audio file by clicking the upload button below. Only mp3
            and wav files are supported.
            <Space h="md" />
            {transcribeError ? (
              <>
                <Alert
                  variant="light"
                  color="red"
                  title="Unable to retrieve transcriptions"
                  icon={<FaCircleInfo />}
                >
                  There was an error in trying to transcribe your audio. This
                  may be because the of a networking issue.
                </Alert>
                <Space h="md" />
              </>
            ) : null}
            <Group justify="center">
              <FileButton onChange={setFile} accept="audio/mp3,audio/wav">
                {(props) => (
                  <Button color="ocean-blue" {...props}>
                    Upload audio
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
            {storeError ? (
              <>
                {" "}
                <Alert
                  variant="light"
                  color="red"
                  title="Unable to transcribe audio"
                  icon={<FaCircleInfo />}
                >
                  There was an error in trying to save your transcription. This
                  may be because the of a networking issue.
                </Alert>
                <Space h="md" />
              </>
            ) : null}
            <Paper shadow="xs" p="xl">
              <Text ta="left">{data?.text}</Text>
            </Paper>
            <Space h="md" />
            <Flex
              gap="xs"
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
            >
              <Button color="ocean-blue">Back</Button>
              <Button
                color="ocean-blue"
                onClick={() => {
                  navigate("/transcriptions");
                }}
              >
                View transcriptions
              </Button>
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
    </>
  );
};

export default Transcribe;

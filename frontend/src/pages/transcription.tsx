import { useSearchParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "react-oidc-context";
import {
  Text,
  Space,
  Container,
  Loader,
  Table,
  Card,
  Divider,
  Group,
} from "@mantine/core";

const Transcription = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [transcriptData, setTranscriptData] = useState();
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [data, setData] = useState();
  const auth = useAuth();

  useEffect(() => {
    const getDocument = async () => {
      setLoading(true);
      try {
        const document = await fetch(
          `${import.meta.env.VITE_DB_ENDPOINT}/getjob`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              id: searchParams.get("id") as string,
              Authorization: auth.user?.access_token || "",
            },
          }
        );
        document
          .json()
          .then(async (job) => {
            setData(job);
            // Get diarizations
            try {
              const transcript = await fetch(
                `${import.meta.env.VITE_DB_ENDPOINT}/gettranscript`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    transcriptid: job?.transcriptId,
                    Authorization: auth.user?.access_token || "",
                  },
                }
              );
              const transcriptResult = await transcript.json();
              setTranscriptData(transcriptResult);
            } catch (err) {
              setFetchError(true);
              console.warn(err);
            }
            return job?.file;
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        setFetchError(true);
        console.warn(err);
        setLoading(false);
      }
    };

    if (!data && auth.user?.access_token) {
      getDocument();
    }
  }, [data, setData]);

  const convertMilliseconds = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Container>
      {loading ? (
        <Loader />
      ) : (
        <>
          {!data ? (
            <Text size="xl">Unable to load transcription</Text>
          ) : (
            <>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Space h="md"></Space>
                  <audio
                    controls
                    src={`${import.meta.env.VITE_S3_ENDPOINT}/stream?key=${
                      data?.file
                    }`}
                    ref={audioPlayerRef}
                  />
                </Card.Section>
                <Space h="md"></Space>
                <Divider />
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{data?.file}</Text>
                </Group>
              </Card>
              <Space h="md"></Space>
              {transcriptData ? (
                <Table>
                  <Table.Tbody>
                    {transcriptData?.diarizations?.map((i: any) => {
                      return (
                        <Table.Tr key={i?.id}>
                          <Table.Td ta="left">
                            Speaker{" "}
                            {i?.speaker.slice(-2).replace(/^0+(?!$)/, "")}
                          </Table.Td>
                          <Table.Td ta="left">
                            <a
                              href="#"
                              onClick={() => {
                                audioPlayerRef.current!.currentTime =
                                  Math.floor(i?.start / 1000);
                                audioPlayerRef.current!.play();
                              }}
                            >
                              {convertMilliseconds(i?.start)} -{" "}
                              {convertMilliseconds(i?.end)}
                            </a>
                          </Table.Td>
                          <Table.Td ta="left">{i?.text}</Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              ) : null}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default Transcription;

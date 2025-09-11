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
  const [audioUrl, setAudioUrl] = useState("");
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
              id: searchParams.get("id"),
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
          // Get file information from S3 API
          .then(async (key) => {
            try {
              const s3request = await fetch(
                `${import.meta.env.VITE_S3_ENDPOINT}/retrieve`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    key: key,
                    Authorization: auth.user?.access_token || "",
                  },
                }
              );
              const s3result = await s3request.text();
              setAudioUrl(s3result);
            } catch (err) {
              setFetchError(true);
              console.warn(err);
            }
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
              {audioUrl ? (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Space h="md"></Space>
                    <audio controls src={audioUrl} ref={audioPlayerRef} />
                  </Card.Section>
                  <Space h="md"></Space>
                  <Divider />
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{data?.file}</Text>
                  </Group>
                </Card>
              ) : null}
              <Space h="md"></Space>
              {transcriptData ? (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Speaker</Table.Th>
                      <Table.Th>Time (mm:ss)</Table.Th>
                      <Table.Th>Text</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {transcriptData?.diarizations?.map((i) => {
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
                              {convertMilliseconds(i?.start)}
                            </a>{" "}
                            - <a href="#">{convertMilliseconds(i?.end)}</a>
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

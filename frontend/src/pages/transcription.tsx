import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Text, Space, Container, Loader } from "@mantine/core";

const Transcription = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [transcriptData, setTranscriptData] = useState();
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
              id: searchParams.get("id"),
              Authorization: auth.user?.access_token || "",
            },
          }
        );
        const job = await document.json();
        setData(job);
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
          console.log(transcriptResult);
        } catch (err) {
          setFetchError(true);
          console.warn(err);
        }
        setLoading(false);
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
              <Text size="xl">{data?.file}</Text>
              <Space h="md"></Space>
              <Space h="md"></Space>
              {transcriptData ? (
                <>
                  {transcriptData?.diarizations?.map((i) => {
                    return (
                      <>
                        <Text ta="left">
                          <a href="#">{i?.start}ms</a> -{" "}
                          <a href="#">{i?.end}ms</a>
                          &nbsp;&nbsp;&nbsp; Speaker{" "}
                          {i?.speaker.slice(-2).replace(/^0+(?!$)/, "")}
                          :&nbsp;{i?.text}
                        </Text>
                      </>
                    );
                  })}
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default Transcription;

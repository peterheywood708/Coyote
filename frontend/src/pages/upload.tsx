import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FileButton,
  Button,
  Group,
  Alert,
  Space,
  Loader,
  Text,
} from "@mantine/core";
import { FaCircleInfo } from "react-icons/fa6";
import { useAuth } from "react-oidc-context";
import {
  VITE_DB_ENDPOINT,
  VITE_SQS_ENDPOINT,
  VITE_S3_ENDPOINT,
} from "../config";

interface IResponse {
  acknowledged: boolean;
  insertedId: string;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<boolean>(false);
  const [dbSaved, setDbSaved] = useState<boolean>(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const NewTranscript = async (fileName: string) => {
    setLoading(true);
    setStoreError(false);
    try {
      const dbResponse: Response = await fetch(`${VITE_DB_ENDPOINT}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth?.user?.access_token || "",
        },
        body: JSON.stringify({
          file: fileName,
          fileName: file?.name,
          status: 0,
        }),
      });
      if (dbResponse?.status != 200) {
        setStoreError(true);
      } else {
        const response: IResponse = await dbResponse.json();
        if (response?.acknowledged) {
          // Add a new job to SQS to start transcription via the speech API
          const newSQS: Response = await fetch(`${VITE_SQS_ENDPOINT}/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: auth?.user?.access_token || "",
            },
            body: JSON.stringify({
              key: fileName,
              jobId: response?.insertedId,
            }),
          });
          if (newSQS?.status != 200) {
            setStoreError(true);
          } else {
            setDbSaved(true);
          }
        }
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
          const response: Response = await fetch(`${VITE_S3_ENDPOINT}/upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: auth?.user?.access_token || "",
              filename: `${Date.now()}_${file?.name}`,
            },
          });

          if (response?.status != 200) {
            setUploadError(true);
            setLoading(false);
          } else {
            const body: string = await response.text();
            NewTranscript(body);
          }
        } catch (err) {
          setUploadError(true);
          console.warn(err);
          setLoading(false);
        }
      }
    };
    if (auth?.user?.access_token) {
      GetData();
    }
  }, [file, auth?.user?.access_token]);

  return (
    <>
      <Text size="xl">Upload audio</Text>

      <Space h="md" />
      {!loading ? (
        !dbSaved ? (
          storeError ? (
            <>
              There was an issue saving the new transcript to the database. The
              audio has been uploaded but transcription has not started.
            </>
          ) : (
            <>
              Select an audio file by clicking the upload button below. Only mp3
              and wav files are supported. Once a file has been uploaded
              successfully, transcription will automatically start.
              <Space h="md" />
              {uploadError ? (
                <>
                  <Alert
                    variant="light"
                    color="red"
                    title="Unable to upload audio"
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
          )
        ) : (
          <>
            {file?.name} has been uploaded and a new job has been created. Click
            the below button to view transcriptions and their progress.
            <Space h="md" />
            <Group justify="center">
              <Button
                color="ocean-blue"
                onClick={() => navigate("/transcriptions")}
              >
                View transcriptions
              </Button>
            </Group>
          </>
        )
      ) : (
        <Loader color="blue" />
      )}
    </>
  );
};

export default Upload;

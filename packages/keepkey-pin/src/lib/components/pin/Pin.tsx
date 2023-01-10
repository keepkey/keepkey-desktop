import type { ButtonProps, SimpleGridProps } from "@chakra-ui/react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CircleIcon } from "lib/components/Icons/Circle";
import { Text } from "lib/components/Text";
// import { logger } from "lib/logger";
// import type { KeyboardEvent } from "react";

// const moduleLogger = logger.child({ namespace: ["Pin"] });

type KeepKeyPinProps = {
  translationType: string;
  gridMaxWidth?: string | number;
  confirmButtonSize?: string;
  buttonsProps?: ButtonProps;
  gridProps?: SimpleGridProps;
};

export const KeepKeyPin = ({
  gridMaxWidth,
  confirmButtonSize,
  buttonsProps,
  gridProps,
}: KeepKeyPinProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPinEmpty, setIsPinEmpty] = useState(true);

  const pinFieldRef = useRef<HTMLInputElement | null>(null);

  const pinNumbers = [7, 8, 9, 4, 5, 6, 1, 2, 3];

  const handlePinPress = useCallback(
    (value: number) => {
      if (pinFieldRef?.current) {
        pinFieldRef.current.value += value.toString();
      }
    },
    [pinFieldRef]
  );

  // const handleSubmit = async () => {
  //   setError(null);
  //   if (translationType !== "remove")
  //     // setDeviceState({
  //     //   isDeviceLoading: true,
  //     // });
  //   // setLoading(true);
  //   const pin = pinFieldRef.current?.value;
  //   if (pin && pin.length > 0) {
  //     try {
  //       // The event handler will pick up the response to the sendPin request
  //       console.log("attempt pin")
  //     } catch (e) {
  //       moduleLogger.error(e, "KeepKey PIN Submit error: ");
  //     } finally {
  //       if (pinFieldRef?.current) {
  //         pinFieldRef.current.value = "";
  //       }
  //       setLoading(false);
  //     }
  //   }
  // };

  // const handleKeyboardInput = (e: KeyboardEvent) => {
  //   // We can't allow tabbing between inputs or the focused element gets out of sync with the KeepKey
  //   if (e.key === "Tab") e.preventDefault();
  //
  //   if (e.key === "Backspace") return;
  //
  //   if (e.key === "Enter") {
  //     handleSubmit();
  //     return;
  //   }
  //
  //   if (!pinNumbers.includes(Number(e.key))) {
  //     e.preventDefault();
  //   } else {
  //     e.preventDefault();
  //     handlePinPress(Number(e.key));
  //   }
  // };
  //
  //
  //
  // }, []);

  const [disablePin, setDisablePin] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDisablePin(false);
    }, 3000);
  }, [disablePin]);

  return (
    <>
      <Text translation="common.name" />
      <SimpleGrid
        columns={3}
        spacing={6}
        my={6}
        maxWidth={gridMaxWidth ?? "250px"}
        ml="auto"
        mr="auto"
        {...gridProps}
      >
        {pinNumbers.map((number) => (
          <Button
            key={number}
            size="lg"
            p={8}
            onClick={() => {
              handlePinPress(number);
              // setIsPinEmpty(!pinFieldRef.current?.value);
            }}
            {...buttonsProps}
          >
            <CircleIcon boxSize={4} />
          </Button>
        ))}
      </SimpleGrid>
      <Input
        type="password"
        ref={pinFieldRef}
        size="lg"
        variant="filled"
        mb={6}
        autoComplete="one-time-code"
        // onKeyDown={handleKeyboardInput}
        // onKeyUp={() => setIsPinEmpty(!pinFieldRef.current?.value)}
      />
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            {/* <Text translation={error} /> */}
          </AlertDescription>
        </Alert>
      )}
      <Button
        width="full"
        size={confirmButtonSize ?? "lg"}
        colorScheme="blue"
        // onClick={handleSubmit}
        disabled={loading || isPinEmpty}
      >
        {/* <Text */}
        {/*  translation={`walletProvider.keepKey.${translationType}.button`} */}
        {/* /> */}
      </Button>
    </>
  );
};

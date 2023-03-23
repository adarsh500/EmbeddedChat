import { Box } from '@rocket.chat/fuselage';
import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastBarProvider } from '@rocket.chat/fuselage-toastbar';
import Cookies from 'js-cookie';
import { ChatBody, ChatHeader, ChatInput, Home } from './components';
import RocketChatInstance from './lib/api';
import { RCInstanceProvider } from './context/RCInstance';
import { useToastStore, useUserStore } from './store';
import { RC_USER_ID_COOKIE, RC_USER_TOKEN_COOKIE } from './lib/constant';
import AttachmentWindow from './components/Attachments/AttachmentWindow';
import useAttachmentWindowStore from './store/attachmentwindow';

const theme = {
  color: {
    primary: 'hotpink',
    background: 'red',
  },
};

export const RCComponent = (props) => {
  const {
    isClosable = false,
    setClosableState,
    moreOpts = false,
    width = '100%',
    height = '50vh',
    GOOGLE_CLIENT_ID,
    host = 'http://192.168.1.7:3000',
    roomId = 'GENERAL',
    channelName,
    anonymousMode = false,
    headerColor = '#fff',
    toastBarPosition = 'bottom-end',
    showRoles = false,
    showAvatar = false,
    enableThreads = false,
    styles = {},
  } = props;
  const [fullScreen, setFullScreen] = useState(false);
  const [embeddedProps, setEmbeddedProps] = useState({});
  const setToastbarPosition = useToastStore((state) => state.setPosition);
  const setShowAvatar = useUserStore((state) => state.setShowAvatar);
  useEffect(() => {
    setToastbarPosition(toastBarPosition);
    setShowAvatar(showAvatar);
  }, []);

  function getSyncScriptParams() {
    const scripts = document.getElementsByTagName('script');
    const lastScript = scripts[scripts.length - 1];
    const scriptName = lastScript;
    setEmbeddedProps({
      width: scriptName.getAttribute('width'),
      height: scriptName.getAttribute('height'),
    });

    console.log('width is', scriptName.getAttribute('width'));
    console.log('height is', scriptName.getAttribute('height'));
  }

  if (isClosable && !setClosableState) {
    throw Error(
      'Please provide a setClosableState to props when isClosable = true'
    );
  }

  const [RCInstance, setRCInstance] = useState(
    () => new RocketChatInstance(host, roomId)
  );

  useEffect(() => {
    if (RCInstance.rcClient.loggedIn) {
      RCInstance.close();
      const newRCInstance = new RocketChatInstance(host, roomId);
      setRCInstance(newRCInstance);
    }
  }, [roomId, host]);

  const isUserAuthenticated = useUserStore(
    (state) => state.isUserAuthenticated
  );
  const setIsUserAuthenticated = useUserStore(
    (state) => state.setIsUserAuthenticated
  );

  useEffect(() => {
    const cookiesPresent =
      Cookies.get(RC_USER_TOKEN_COOKIE) && Cookies.get(RC_USER_ID_COOKIE);

    if (cookiesPresent) {
      setIsUserAuthenticated(true);
    }
    getSyncScriptParams();
  }, []);

  const authenticatedUserUsername = useUserStore((state) => state.username);
  const authenticatedUserAvatarUrl = useUserStore((state) => state.avatarUrl);
  const authenticatedUserId = useUserStore((state) => state.userId);

  const setAuthenticatedUserUsername = useUserStore(
    (state) => state.setUsername
  );
  const setAuthenticatedUserAvatarUrl = useUserStore(
    (state) => state.setUserAvatarUrl
  );
  const setAuthenticatedUserId = useUserStore((state) => state.setUserId);
  const setAuthenticatedName = useUserStore((state) => state.setName);

  useEffect(() => {
    async function getUserEssentials() {
      const res = await RCInstance.me();
      if (res.status === 'error') {
        setIsUserAuthenticated(false);
      } else {
        setAuthenticatedUserAvatarUrl(res.avatarUrl);
        setAuthenticatedUserUsername(res.username);
        setAuthenticatedUserId(res._id);
        setAuthenticatedName(res.name);
      }
    }

    const cookiesPresent =
      Cookies.get(RC_USER_TOKEN_COOKIE) && Cookies.get(RC_USER_ID_COOKIE);
    if (cookiesPresent) {
      setIsUserAuthenticated(true);
    }

    const currentUserId = Cookies.get(RC_USER_ID_COOKIE);
    if (
      !authenticatedUserUsername ||
      !authenticatedUserAvatarUrl ||
      authenticatedUserId !== currentUserId
    ) {
      getUserEssentials();
    }
  }, [RCInstance]);

  const attachmentWindowOpen = useAttachmentWindowStore((state) => state.open);

  const ECOptions = useMemo(
    () => ({
      enableThreads,
    }),
    [enableThreads]
  );

  return (
    <ThemeProvider theme={theme}>
      <ToastBarProvider>
        <RCInstanceProvider value={{ RCInstance, ECOptions }}>
          {attachmentWindowOpen ? <AttachmentWindow /> : null}
          <Box
            width={width}
            overflowX="hidden"
            overflowY="hidden"
            maxHeight="100vh"
          >
            <ChatHeader
              channelName={channelName}
              isClosable={isClosable}
              setClosableState={setClosableState}
              moreOpts={moreOpts}
              fullScreen={fullScreen}
              setFullScreen={setFullScreen}
              headerColor={headerColor}
            />
            {isUserAuthenticated || anonymousMode ? (
              <ChatBody
                height={!fullScreen ? height : '88vh'}
                anonymousMode={anonymousMode}
                showRoles={showRoles}
                GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}
              />
            ) : (
              <Home height={!fullScreen ? height : '88vh'} />
            )}
            <ChatInput />
          </Box>
        </RCInstanceProvider>
      </ToastBarProvider>
    </ThemeProvider>
  );
};

RCComponent.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isClosable: PropTypes.bool,
  setClosableState: PropTypes.func,
  moreOpts: PropTypes.bool,
  GOOGLE_CLIENT_ID: PropTypes.string,
  host: PropTypes.string,
  roomId: PropTypes.string,
  channelName: PropTypes.string,
  anonymousMode: PropTypes.bool,
  headerColor: PropTypes.string,
  toastBarPosition: PropTypes.string,
  showRoles: PropTypes.bool,
  showAvatar: PropTypes.bool,
  enableThreads: PropTypes.bool,
  styles: PropTypes.object,
};

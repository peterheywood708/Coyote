import { useState } from 'react'
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

function App() {
  const [opened, {toggle}] = useDisclosure();

  return (
    <MantineProvider>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <div><h2>Coyote</h2></div>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>Upload and transcribe audio</AppShell.Main>
    </AppShell>
    </MantineProvider>
  )
}

export default App

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Tailwind,
  } from '@react-email/components'
  
  
  export default async function BasicTemplate() {
    const currentDate = new Date()
    return (
      <Html>
        <Preview>Basic email</Preview>
        <Tailwind>
          <Head />
          <Body className='font-sans bg-white'>
            <Container className='max-w-xl'>
              <Heading> Email enviando at {currentDate.toString()}</Heading>
             
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }
import { Box, Text, Link, HStack } from "@chakra-ui/react";

const Footer = () => (
  <Box as="footer" py={4} textAlign="center" color="gray.500">
    <HStack justify="center" spacing={2}>
      <Text>© {new Date().getFullYear()} Kanzariya Akshay</Text>
      <Link href="https://github.com/akshayk7k" isExternal color="teal.500">
        GitHub
      </Link>
      <Text>|</Text>
      <Link href="https://www.linkedin.com/in/akshay-kanzariya-2b7b3b247" isExternal color="teal.500">
        LinkedIn
      </Link>
    </HStack>
  </Box>
);

export default Footer;
import React from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Stack, Chip, Divider } from '@mui/material';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

export default function Faq() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <HelpCircle size={24} />
        <Typography variant="h5">FAQ</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Coming Soon — Curated answers for common questions. Role-aware content.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography>How will FAQs be managed?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            FAQs will be stored in Firestore (collection: <code>faqs</code>) with categories & roles.
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography>Will answers link to deeper articles?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            Yes. Each FAQ can reference an article slug or ID for “Learn more”.
          </AccordionDetails>
        </Accordion>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip icon={<MessageCircle size={16} />} label="Content model: faqs" />
        </Stack>
      </Paper>
    </Box>
  );
}

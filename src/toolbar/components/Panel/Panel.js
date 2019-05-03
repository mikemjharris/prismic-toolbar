import { TransitionGroup } from 'react-transition-group';
import { switchy } from 'common';
import { views, Animation } from '..';
import { DocumentPanel, PreviewPanel, SharePanel } from '.';

const { DOCS, DRAFTS, SHARE } = views;

export const Panel = ({ closePanel, documents, docData, preview, page, onDocumentClick }) => (
  <TransitionGroup>{
    !page || (
      <Animation.SlideIn key={1}>{
        switchy(page)({
          [DOCS]: <DocumentPanel documents={documents} docData={docData} onClose={closePanel} onDocumentClick={onDocumentClick} />,
          [DRAFTS]: <PreviewPanel preview={preview} onClose={closePanel} />,
          [SHARE]: <SharePanel preview={preview} onClose={closePanel} />,
        })
      }</Animation.SlideIn> 
    )
  }</TransitionGroup>
)

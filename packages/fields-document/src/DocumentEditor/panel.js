/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Range, Transforms } from 'slate';

import { Button } from './components';
import { isBlockTextEmpty, getBlockAboveSelection, isBlockActive } from './utils';

const PANEL_TYPES = {
  note: {
    background: '#EBF8FF',
    border: '#90CDF4',
    foreground: '#2C5282',
    icon: '👋',
  },
  alert: {
    background: '#FFF5F5',
    border: '#FEB2B2',
    foreground: '#9B2C2C',
    icon: '🚨',
  },
  tip: {
    background: '#EBF4FF',
    border: '#C3DAFE',
    foreground: '#4C51BF',
    icon: '💎',
  },
  success: {
    background: '#F0FFF4',
    border: '#9AE6B4',
    foreground: '#276749',
    icon: '✅',
  },
};
const PANEL_TYPE_KEYS = Object.keys(PANEL_TYPES);
const DEFAULT_PANEL_TYPE = PANEL_TYPE_KEYS[0];

const panelElement = { type: 'panel', panelType: DEFAULT_PANEL_TYPE, children: [{ text: '' }] };

export const isInsidePanel = editor => {
  return isBlockActive(editor, 'panel');
};

export const insertPanel = editor => {
  if (isInsidePanel(editor)) return;
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block] = getBlockAboveSelection(editor);
  if (!!block && isCollapsed && isBlockTextEmpty(block)) {
    Transforms.setNodes(
      editor,
      { type: 'panel', panelType: DEFAULT_PANEL_TYPE },
      { match: n => Editor.isBlock(editor, n) }
    );
  } else {
    Transforms.insertNodes(editor, panelElement, { select: true });
  }
};

export const withPanel = editor => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const panel = Editor.above(editor, {
      match: n => n.type === 'panel',
    });
    if (panel) {
      const [, path] = panel;
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        {
          at: Path.next(path),
          select: true,
        }
      );
      return;
    }

    insertBreak();
  };
  return editor;
};

export const PanelOptions = ({ value, onChange }) => {
  const panelTypeKey = PANEL_TYPES[value.panelType] ? value.panelType : DEFAULT_PANEL_TYPE;
  const panelType = PANEL_TYPES[panelTypeKey];

  return (
    <div>
      <h4>Panel Type: </h4>
      {PANEL_TYPE_KEYS.map(type => (
        <Button
          isPressed={type === panelType}
          key={type}
          onMouseDown={event => {
            event.preventDefault();
            onChange({ panelType: type });
          }}
        >
          {type}
        </Button>
      ))}
    </div>
  );
};

export const PanelElement = ({ attributes, children, element }) => {
  const panelTypeKey = PANEL_TYPES[element.panelType] ? element.panelType : DEFAULT_PANEL_TYPE;
  const panelType = PANEL_TYPES[panelTypeKey];

  return (
    <div
      css={{
        margin: '8px 0',
        borderColor: panelType.border,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: panelType.background,
        color: panelType.foreground,
      }}
      {...attributes}
    >
      <div
        contentEditable={false}
        style={{
          userSelect: 'none',
          margin: 12,
          fontSize: 16,
          float: 'left',
        }}
      >
        {panelType.icon}
      </div>
      <p>{children}</p>
    </div>
  );
};

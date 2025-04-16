import React from 'react'
import RenderHtml, { CustomBlockRenderer } from 'react-native-render-html';
import { Platform, Text, useWindowDimensions } from 'react-native';
import { cleanHtmlRenderHtml } from '../hooks/useFormats';

interface PropsHtmlToJsx {
    strHtml: string;
    styles?: string;
}

export const HtmlToJsx = ({strHtml,styles='margin: 10px; padding-bottom: 10px'}:PropsHtmlToJsx) => {
    // (TypeScript) Notice the type for intellisense
    const TableRenderer: CustomBlockRenderer = function TableRenderer({ TDefaultRenderer, ...props }) {
        // console.log(props.sharedProps);
        return <TDefaultRenderer {...props} style={ { ...props.style, maxWidth: width-80, borderColor: 'black' } }/>;
    }
    const TrRenderer: CustomBlockRenderer = function TrRenderer({ TDefaultRenderer, ...props }) {
        // console.log(props.sharedProps);
        return <TDefaultRenderer {...props} style={ { ...props.style, height: 'auto', borderWidth: 1 } }/>;
    }
    const TdRenderer: CustomBlockRenderer = function TdRenderer({ TDefaultRenderer, ...props }) {
        return <TDefaultRenderer {...props} style={ { ...props.style, height: 'auto', borderWidth: 1 } }/>;
    }

    const renderers = { td: TdRenderer, tr: TrRenderer, table: TableRenderer }
    const cleanHTML = cleanHtmlRenderHtml(strHtml);
    const { width } = useWindowDimensions();
    const widthRender = Platform.OS !== 'ios' ? width-100 : width;
    return (
        <RenderHtml
            contentWidth={width-10}
            source={{html: `<div style="width: ${width};${styles}">${cleanHTML}</div>`}}
            // renderersProps={renderersProps}
            renderers={renderers}
            tagsStyles={
                {
                    p: {
                        maxWidth: widthRender,
                    },
                    strong: {
                        maxWidth: widthRender,
                        margin: 0,
                    },
                }
            }
        />
    )
}

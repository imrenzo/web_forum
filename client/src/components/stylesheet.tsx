import CSS from "csstype";

const width: string = '20%'

export const pageBoxStyle: { marginLeft: string, marginRight: string } = {
    marginLeft: width,
    marginRight: width,
};

export const formStyles: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    maxWidth: '400px',
    margin: '0 auto'
};
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface Post {
    post_title: string;
    post_id: number;
    op_id: number;
    post_info: string;
    post_date: string;
}

interface OutlinedCardProps {
    posts: Post[];
}



export default function OutlinedCard({ posts }: OutlinedCardProps) {
    return (
        <Box>
            {posts.map((item) =>
                <Card key={item.post_id} variant="outlined" sx = {{ width: '100%', marginTop: 2}}>
                    <React.Fragment>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {item.post_title}
                            </Typography>
                            <Typography variant='body1' sx={{}}>
                                {item.post_info}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small">Comment</Button>
                        </CardActions>
                    </React.Fragment>
                </Card>
            )}
        </Box>
    );
}

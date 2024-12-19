import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

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
                <Link key={item.post_id} to={`/id/${item.post_id}`} style={{ textDecoration: 'none' }}>
                    <Card variant="outlined" sx={{ width: '100%', marginTop: 2 }}>
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
                                {/* like, comment, shar */}
                            </CardActions>
                        </React.Fragment>
                    </Card>
                </Link>
            )}
        </Box>
    );
}
